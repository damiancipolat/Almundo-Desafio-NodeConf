const fs     = require('fs');
const file   = './dataset.csv';
const output = './combos.csv';

//Clasifico precios por rangos.
const precios = {bajo  : 10000,
                 medio : 20000,
                 alto  : 30000};

//Total de combinaciones.
const maxCombos = 40000;

//Obtengo el archivo cargado y separado por linea en un array, de forma async.
const fullLoadFile = (filePath)=>{

  return new Promise((resolve,reject)=>{

    let fileData = [];

    try{

      fs.readFile(filePath, 'utf-8', (err, data) => {

        if(err)
          reject(err);
        else
          resolve(data.split(/\r?\n/));

      });

    }
    catch(errExcp){
      reject(errExcp);
    }

  });

}

//Parseo los campos del archivo.
const splitLine = (line)=>{

  const lineArr = line.split(',');

  if (lineArr.length==4)
    return { iditem    : lineArr[0],
             typeitem  : lineArr[1],
             iddestino : lineArr[2],
             valor     : parseInt(lineArr[3])};
  else
    return null;

}

//Separo los datos por concepto, hotel y vuelos y en cada caso por destino.
const groupByType = (bd)=>{

  let resuBd = {vuelos  : [],
                hoteles : []};

  bd.forEach((item)=>{

    if (item!=null){

      //Guardo los hoteles agrupado por destino.
      if (item.typeitem=='HOTEL'){

        if (resuBd.hoteles[item.iddestino]!=null)
          resuBd.hoteles[item.iddestino].push(item);
        else
          resuBd.hoteles[item.iddestino] = [item];
        
      }

      //Guardo todos los vuelos, sin agrupar.
      if (item.typeitem=='VUELO')
        resuBd.vuelos.push(item);

    }

  });

  return resuBd;

}

//Traigo el simbolo del rango.
const getClasif = (valor)=>{

  if (valor <= precios.bajo)  return 'b';
  if (valor <= precios.medio) return 'm';
  if (valor <= precios.alto)  return 'a';

  return null;

}

//Clasifico la bd.
const bdClasificar = (prodBd)=>{

  let bdPrices = {bajo  : [],
                  medio : [],
                  alto  : []};

  //Recorro todos los vuelos armando combinaciones.
  prodBd.vuelos.forEach((vuelo)=>{

    //Recorro los destinos.
    prodBd.hoteles[vuelo.iddestino].forEach((hotel)=>{

      //Traigo la clasif de la combinación.
      let clasif = getClasif(hotel.valor+vuelo.valor);

      //Cargo en la bd segun la franja de precios.
      if (clasif=='b') bdPrices.bajo.push(vuelo.iditem +','+hotel.iditem);
      if (clasif=='m') bdPrices.medio.push(vuelo.iditem+','+hotel.iditem);
      if (clasif=='a') bdPrices.alto.push(vuelo.iditem +','+hotel.iditem);

    });

  });

  return bdPrices;

}

//Vuelco el tope de combinaciones.
const makeCombos = (bd,output)=>{

  //Unifico todas las franjas.
  let total = [...bd.bajo,...bd.medio,...bd.alto];
  let data = '';

  //Si se puede procesar el total de combos.
  for (let i=1;i<=maxCombos;i++)
    data = data + total[i] + "\n";
  
  //Libero memoria.
  total = null;

  fs.writeFile(output, data, (error)=>{
       
     if (error)
       console.error("write error:  " + error.message);
     else
       console.log("combos.csv OK!");     

  });

}

//Cargo el array con los datos parseados.
fullLoadFile(file).then((data)=>{

  //Obtengo los items separados por hoteles y vuelos.
  let prodBd   = groupByType(data.map((line) => splitLine(line)));

  //Clasifico toda la bd por precios.
  let bdPrices = bdClasificar(prodBd);

  //Vuelco los datos al archivo de combos.
  makeCombos(bdPrices,output);

  //Libero memoria.
  prodBd = null;

}).catch((err)=>{

  console.log('error app',err);

});