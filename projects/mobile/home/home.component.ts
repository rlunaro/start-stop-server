import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import { environment  }  from '../environments/environment';
import { Subscription, interval } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';

interface Server {
  id: string, 
  instanceId?: string, 
  name: string, 
  url?: string, 
  description?: string
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ NgFor, NgIf, FormsModule ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  public version : string;
  public serverList: Server[] = [];
  public currentServer = 0;

  private serverStatusSubs : Subscription | undefined;
  public statusMessage : string;
  public isStarting : boolean = false;
  public isStopping : boolean = false;
  
  
  constructor( private http : HttpClient ){
    this.version = environment.version;
    this.statusMessage = "N/A";
    this.loadServerList()
    .then( (serverList) => {
      this.updateServerStatus();
      this.serverStatusSubs = interval(5000).subscribe(() => {
        this.updateServerStatus();
      });
    });
  }

  ngOnInit(){
    this.currentServer = this.getCurrentServer( );
    console.log("current server ", this.currentServer );
  }

  ngOnDestroy(){
    this.setCurrentServer( );
    if( this.serverStatusSubs )
      this.serverStatusSubs.unsubscribe();
  }

  private loadServerList(){
    return new Promise( (resolve,reject) =>{ 
      this.http.get( environment.endpoint, 
        { params: 
           {"op": "list" }
        })
        .subscribe( (response:any) => {
          console.log("load server response: ", response ); 
          this.serverList = response;
          resolve( this.serverList );
        });
    });
    
  }

  getCurrentServer( ) : number {
    if( localStorage.getItem("currentServer") ){
      return parseInt( <string> localStorage.getItem("currentServer") );
    }else{
      return this.currentServer;
    }
  }

  setCurrentServer( ){
    localStorage.setItem("currentServer", this.currentServer.toString());
  }

  updateServerStatus(){
    this.http.get( environment.endpoint, 
                    { params: 
                      { "op": "status", 
                        "server": this.serverList[this.currentServer].id
                      }
                    })
    .subscribe( ( response : any ) => {
      this.statusMessage = "";
      let instanceStatus = response["InstanceStatuses"][0];
      console.log( instanceStatus );
      if( instanceStatus["InstanceState"]["Name"] === "running" )
        this.statusMessage = "encendido";
      else if( instanceStatus["InstanceState"]["Name"] === "stopped" )
        this.statusMessage = "detenido";
      else if( instanceStatus["InstanceState"]["Name"] === "stopping" )
        this.statusMessage = "deteniéndose";
      else
        this.statusMessage = instanceStatus["InstanceState"]["Name"];
    });
  }

  startServer(){
    this.setCurrentServer();
    this.isStarting = true;
    this.statusMessage = "encendiéndose";
    this.http.get( environment.endpoint,
      {params: 
        {"op": "start",
      "server": this.serverList[this.currentServer].id }} )
    .subscribe( (x) => {
      this.isStarting = false;
      this.updateServerStatus();
    });
  }

  stopServer(){
    this.setCurrentServer();
    this.isStopping = true;
    this.statusMessage = "apagándose";
    this.http.get( environment.endpoint,
      {params: 
        {"op": "stop",
      "server": this.serverList[this.currentServer].id }} )
    .subscribe( (x) => {
      this.isStopping = false;
      this.updateServerStatus();
    });
  }

}
