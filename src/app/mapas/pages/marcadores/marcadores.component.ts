import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [ number, number ]
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
    .mapa-container {
      width: 100%;
      height: 100%;
    }

    .list-group {
      position: fixed;
      top:20px;
      right:20px;
      z-index:99;
    }

    li {
      cursor: pointer;
    }
`
  ]
})
export class MarcadoresComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef  // apunta a referencia local #mapa
  mapa!: mapboxgl.Map;

  nivelZoom: number = 15;
  longitud: number = -4.244643529769581
  latitud: number = 41.93908785027047;
  center: [ number, number ] = [ this.longitud, this.latitud ];

  marcadores: MarcadorColor[] = [];
  //marcadores: mapboxgl.Marker[] = [];

  constructor( private snackBar: MatSnackBar ) { }

  ngAfterViewInit(): void {

    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      //center: [ this.longitud, this.latitud ],
      center: this.center,
      zoom: this.nivelZoom
    });

    const el = document.createElement('div');
    el.className = 'bi bi-house-fill';
    el.style.width = '10em;';
    el.style.height = '20px';
    el.style.color = 'teal';
    
    const marker = new mapboxgl.Marker(el)
      .setLngLat( this.center )
      .addTo ( this.mapa );

    this.leerMarcadoresLocalStorage();
  }

  agregarMarcador() {

    const color = "#xxxxxx".replace(/x/g, y => (Math.random()*16|0).toString(16));

    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color: color
    })
      .setLngLat( this.center )
      .addTo ( this.mapa );

    this.marcadores.push({ color: color, marker: nuevoMarcador }); 

    this.guardarMarcadoresLocalStorage();

    nuevoMarcador.on('dragend', () => {
      this.guardarMarcadoresLocalStorage();
    })

    this.mostrarSnackBar('Marcador agregado');

  }

  irMarcador(i: mapboxgl.Marker) {

    let bearing: number = this.mapa.getBearing();

    this.mapa.flyTo({
      center: [
        i.getLngLat().lng,
        i.getLngLat().lat
      ],
      bearing: (bearing + 180) % 360,
      speed: 0.7,
      zoom: 17,
      curve: 1
      
    })
  
  }

  guardarMarcadoresLocalStorage() {

    const lngLatArr: MarcadorColor[] = [];

    this.marcadores.forEach( m => {
      
      const color = m.color;
      const { lng, lat } = m.marker!.getLngLat();

      lngLatArr.push({
        color: color,
        centro: [ lng, lat ]
      });
      
    });

    localStorage.setItem( 'marcadores', JSON.stringify(lngLatArr) );

  }

  borrarMarcador(i: number) {
    
    this.marcadores[i].marker?.remove();
    this.marcadores.splice(i , 1);
    this.guardarMarcadoresLocalStorage();
    
  }

  leerMarcadoresLocalStorage() {
    if ( !localStorage.getItem('marcadores') ) {
      return;
    }

    const lngLatArr: MarcadorColor[] = JSON.parse( localStorage.getItem('marcadores')! );

    lngLatArr.forEach ( m => {

      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true,
      })
        .setLngLat( m.centro! )
        .addTo ( this.mapa )

        this.marcadores.push( {
          marker: newMarker,
          color: m.color
        })

        newMarker.on('dragend', () => {
          this.guardarMarcadoresLocalStorage();
        })

    })
      

  }

  mostrarSnackBar(mensaje: string): void {
    
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 1000,
      panelClass: 'miaviso'
      
    });
  }
}
