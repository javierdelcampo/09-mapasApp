import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-zoom-range',
  templateUrl: './zoom-range.component.html',
  styles: [
    `
      .mapa-container {
        width: 100%;
        height: 100%;
      }

      .row {
        background-color: white;
        border-radius: 5px;
        position: fixed;
        bottom: 50px;
        left: 50px;
        padding:10px;
        z-index: 999;
        width: 400px;
      }
    `
  ]
})
export class ZoomRangeComponent implements AfterViewInit, OnDestroy {

  @ViewChild('mapa') divMapa!: ElementRef  // apunta a referencia local #mapa
  mapa!: mapboxgl.Map;

  nivelZoom: number = 17;
  longitud: number = -4.244643529769581
  latitud: number = 41.93908785027047;
  center: [ number, number ] = [ this.longitud, this.latitud ];

  constructor() { }

  ngOnDestroy(): void {
    this.mapa.off('zoom', () => {});
    this.mapa.off('zoomend', () => {});
    this.mapa.off('move', () => {});
  }

  
  ngAfterViewInit(): void {

    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      //center: [ this.longitud, this.latitud ],
      center: this.center,
      zoom: this.nivelZoom
    });

    this.mapa.on('zoom', (evento) => {  // con esto capturamos todos los eventos de zoom, incluyendo wheel
      this.nivelZoom = this.mapa.getZoom();
    })

    this.mapa.on('zoomend', (evento) => {
      if (this.mapa.getZoom() > 18) {
        this.mapa.zoomTo(18);
      }
    })

    this.mapa.on('move', (evento) => {
      //this.longitud = this.mapa.getCenter().lng;
      //this.latitud = this.mapa.getCenter().lat;
      this.center = [this.mapa.getCenter().lng, this.mapa.getCenter().lat]
    })
  }

  zoomOut() {
    this.mapa.zoomOut();
    //this.nivelZoom = this.mapa.getZoom();
  }

  zoonIn() {
    this.mapa.zoomIn();
    //this.nivelZoom = this.mapa.getZoom();
  }

  zoomCambio(valor: string) {
    
    console.log(valor);
    
    this.mapa.zoomTo(parseInt(valor));
  }

  home() {
    //this.mapa.setCenter([ this.longitud, this.latitud ]);
    this.mapa.flyTo({ center: [this.longitud, this.latitud ], zoom: 17 });
  }

}
