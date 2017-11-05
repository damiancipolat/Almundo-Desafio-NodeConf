# Almundo-Desafio-NodeConf
> Repositorio con mis resoluciones al desafio propuesto por Almundo.com https://almundo.com.ar/nodeconf17/home


### Enunciado "Node Challenge":
Un viaje típico en Almundo incluye un destino, un vuelo y un hotel. A partir de estos tres componentes, generamos paquetes, diseñados para ofrecer las mejores experiencias de viaje a nuestros clientes. ¡Este ejercicio te desafía a crear paquetes atractivos para nuestros viajeros!

El set de datos para esta competencia es un archivo en formato CSV con nombre 'dataset.csv' y usando ',' como separador. Contiene vuelos y hoteles.

Cada ítem tiene como caraterísiticas:

ID de ítem (formato UUID)
Tipo de ítem ('VUELO' u 'HOTEL')
ID de destino (formato UUID)
Su costo, valor entero menor a 30000 y mayor a 0 (Ej. 4000)
Ejemplo de contenido del archivo 'dataset.csv':

      dd5d253e-a872-4e8c-8fcc-331248541693,VUELO,38b99f55-c076-4ddb-a5ea-c18c6e492821,12214
      e0293fb7-21e9-47d3-9861-d162af400541,HOTEL,38b99f55-c076-4ddb-a5ea-c18c6e492821,13546
      e5b69ec5-3c07-4faf-a589-e1b7013e6b10,VUELO,04e2e3dc-ca26-453b-8730-1ff6053d9b2f,11390
      55fadcf5-f1b3-42ca-bfeb-106ff97ca012,HOTEL,04e2e3dc-ca26-453b-8730-1ff6053d9b2f,5371
      ...
    
El desafío consiste en programar un script JS que correrá en un entorno Node.js controlado por Almundo durante 10 segundos. El script deberá leer el set de datos para armar combinaciones de vuelo + hotel, que cumplan con las siguientes restricciones:

Debes generar hasta 40000 combinaciones, que representan los paquetes que se venden en un día
Se combina siempre 1 vuelo con 1 hotel que deben tener el mismo ID de destino
El costo de la combinación (costo del vuelo + costo del hotel) no puede superar el valor 30000, que representa el gasto promedio de un viajero
Las combinaciones deben escribirse en un archivo de salida en formato CSV que a su vez:
Debe llamarse 'combos.csv' (case sensitive)
Debe usar el caracter ',' (coma) como separador
Debe contener para cada línea el ID del vuelo y el ID del hotel que conforman la combinación, en ese orden
Ejemplo de contenido del archivo 'combos.csv' a generar:

      dd5d253e-a872-4e8c-8fcc-331248541693,e0293fb7-21e9-47d3-9861-d162af400541
      e5b69ec5-3c07-4faf-a589-e1b7013e6b10,55fadcf5-f1b3-42ca-bfeb-106ff97ca012
      ...
    
Tu puntaje dependerá de las combinaciones generadas. Combinaciones inválidas descalificarán tu solución (no obtendrás puntaje). Combinaciones duplicadas y más allá de 40000 serán ignoradas (no se tendrán en cuenta al calcular tu puntaje, porque tomaremos las primeras 40000). Si no llegaste a completar las 40000 combinaciones, te las completaremos nosotros con combinaciones de costo 2, que serán muy malas para tu puntaje. ¡Te conviene llegar a generar 40000!


- ### Resoluciones:

#### Single:
Solución usando una solución de proceso basado en un single thread que es el mismo del proceso.

```sh
$ cd single
$ node app.js
```

> Este no resulto ser exitoso debido a que excedia los 10 segundos de ejecución.



