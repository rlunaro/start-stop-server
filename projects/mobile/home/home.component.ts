import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import { environment  }  from '../environments/environment';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ NgFor, NgIf ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {


  public serverList = [{
    id : "1", 
    name: "Craft2Exile (Cesar, Jorge, Santi...)"
  },
  {
    id : "2",
    name: "CreateMod (Quique, Martín, Santi)"
  }];
  public currentServer = 0;


  private serverStatusSubs : Subscription;
  public serverStatus : string[];
  public isStarting : boolean = false;
  public isStopping : boolean = false;
  
  
  constructor( private http : HttpClient ){
    this.serverStatus = ["N/A"];
    this.updateServerStatus();
    this.serverStatusSubs = interval(5000).subscribe(() => {
      this.updateServerStatus();
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
      // console.log( response );
      this.serverStatus = [];
      for( let instanceStatus of response["InstanceStatuses"] ){
        if( instanceStatus["InstanceState"]["Name"] === "running" )
          this.serverStatus.push( "encendido" );
        else if( instanceStatus["InstanceState"]["Name"] === "stopped" )
          this.serverStatus.push( "detenido" );
        else if( instanceStatus["InstanceState"]["Name"] === "stopping" )
          this.serverStatus.push( "deteniéndose" );
        else
          this.serverStatus.push( instanceStatus["InstanceState"]["Name"] );
      }
    });
  }

  startServer(){
    this.isStarting = true;
    this.serverStatus[0] = "encendiéndose";
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
    this.isStopping = true;
    this.serverStatus[0] = "apagándose";
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
