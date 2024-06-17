import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';

import { environment  }  from '../environments/environment';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ NgFor ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  private serverStatusSubs : Subscription;
  public serverStatus : string[];
  
  constructor( private http : HttpClient ){
    this.serverStatus = ["N/A"];
    this.updateServerStatus();
    this.serverStatusSubs = interval(5000).subscribe(() => {
      this.updateServerStatus();
    });

  }

  ngOnInit(){
  }

  ngOnDestroy(){
    if( this.serverStatusSubs )
      this.serverStatusSubs.unsubscribe();
  }

  updateServerStatus(){
    this.http.get( environment.endpoint, 
                    { params: 
                      { "op": "status", 
                        "server": "1"
                      }
                    })
    .subscribe( ( response : any ) => {
      console.log( response );
      this.serverStatus = [];
      for( let instanceStatus of response["InstanceStatuses"] ){
        if( instanceStatus["InstanceState"]["Name"] === "running" )
          this.serverStatus.push( "encendido" );
        else if( instanceStatus["InstanceState"]["Name"] === "stopped" )
          this.serverStatus.push( "detenido" );
        else
          this.serverStatus.push( instanceStatus["InstanceState"]["Name"] );
      }
    });
  }

  startServer(){
    this.http.get( environment.endpoint,
                          {params: 
                            {"op": "start",
                          "server": "1" }} )
    .subscribe( (x) => {
        console.log("received: " );
        console.log( x );
      });
              
  }

}
