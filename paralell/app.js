//Incluyo FS y Cluster para paralelismo.
const fs      = require('fs');
const cluster = require('cluster');

const nProcs = 4;
const file   = './dataset.csv';
const output = './combos.csv';
let   prodBd = null;

//Clasifico precios por rangos.
const precios = {bajo  : 10000,
                 medio : 20000,
                 alto  : 30000};

//Total de combinaciones.
const maxCombos   = 40000;
let   resultArray = [];

//Traigo el largo del array de destinos.
const dictSize = (obj) => {
    
    let size = 0, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }

    return size;

};

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

  let destGroup = [];

  //Recorro todo el array para agrupar por destinos.
  bd.forEach((item) => {

    if (item!=null){

      //Si esta el destino en el array.
      if (destGroup[item.iddestino] == null)
        destGroup[item.iddestino] = {vuelos  : (item.typeitem=='VUELO')?[item]:[], 
                                     hoteles : (item.typeitem=='HOTEL')?[item]:[],
                                     destino : item.iddestino};
      else{

        //Si es un hotel.
        if (item.typeitem=='HOTEL')
          destGroup[item.iddestino].hoteles.push(item);

        //Si es un vuelo.
        if (item.typeitem=='VUELO')
          destGroup[item.iddestino].vuelos.push(item);

      }

    }

  });

  return destGroup;

}

//Separo un array en partes iguales, en caso que no sea exacto fuera al a
const chunkify = (arr, size)=>{
    
    let i,j   = arr.length,

    tempArray = [];
    
    for (i=0; i<j; i+=size)
        tempArray.push(arr.slice(i,i+size));   

    //Si el reparto no fue en cantidades iguales.
    if (tempArray.length>size)
      tempArray[tempArray.length-2] = [...tempArray[tempArray.length-2],
                                       ...tempArray[tempArray.length-1]];

    return tempArray

}

//Vuelco el tope de combinaciones.
const makeCombos = (bd,output)=>{

  //Concateno todos los resultados.
  let data = '';

  for (let id in bd){

    if (bd[id].complete){      
      data = data + bd[id].values;
    }

  }

  //Retorno la promise.
  return new Promise((resolve,reject)=>{

    //Vuelco al archivo.
    fs.writeFile(output, data, (error)=>{
         
       if (error){

         console.error("write error:  " + error.message);
         reject(error);

       }
       else{        

         console.log("combos.csv OK!");     
         resolve(null);

       }

    });

  });

}

//Revisar si la ejecución esta ok.
const readyCompute = ()=>{

  let ok = 0;

  for (let a in resultArray){

    if (resultArray[a].complete)
      ok++;

  }

  return (ok==nProcs);

}

//Vuelco un array diccionario a un array plano.
const planeArray = (dic) =>{

  let final = [];

  for (let a in dic)
    final.push(dic[a]);

  return final;

}

//Traigo el simbolo del rango.
const getClasif = (valor)=>{

  if (valor <= precios.bajo)  return 'b';
  if (valor <= precios.medio) return 'm';
  if (valor <= precios.alto)  return 'a';

  return null;

}

//Handler: Cuando recibo un mensaje de un children.
const onChildMsg = (msg) =>{

  //Cuando recibo el msg de proceso terminado.
  if (msg.cmd=='proc-req-response'){

    //Actualizo estado.
    resultArray[msg.idProc] = {complete:true, values:msg.data};

    console.log('-> ready children process',msg.idProc);

    //Si termino, fin del programa.
    if (readyCompute())
    {
      
      console.log('Vuelco a',output);

      //Vuelco a combos.
      makeCombos(resultArray,output).then((ok)=>{

        console.log('> END OK!');
        process.exit();

      }).catch((error)=>{

        console.log('> error en dump',error);
        process.exit();

      });

    }
  }

}

//Handler: Cuando recibo un mensaje del proceso master.
const onMasterMsg = (msg) =>{

  //Cuando recibo la solic. de proceso.
  if (msg.cmd == 'proc-req'){

    //Obtengo la lista de destinos.
    let groups = groupByRange(msg.data);

    //Envio al proceso el resultado de la ejecución.
    try{      
      process.send({cmd:'proc-req-response', data:groups, idProc:msg.idProc});      
    }catch(error){
      console.log('error',groups.length,msg.idProc);
    }   
    
    groups = null;

  }

}

//Armo agrupaciones por precios.
const groupByRange = (group)=>{

  let rangos = {bajos  : '',
                medios : ''};

  //Array por grupos.
  group.forEach((gObj)=>{

    //Recorro la lista de vuelos.
    gObj.vuelos.forEach((vuelo)=>{
      
      //Recorros los hoteles por cada destinos.
      gObj.hoteles.forEach((hotel)=>{

        //Traigo la clasif. por precio.
        let priceClasif = getClasif(vuelo.valor+hotel.valor);

        //Concateno en cada rango.
        if (priceClasif=='b')
          rangos.bajos  = rangos.bajos + vuelo.iditem + ',' + hotel.iditem + "\n";

        if (priceClasif=='m')
          rangos.medios = rangos.medios + vuelo.iditem + ',' + hotel.iditem + "\n";

      });
      
    }); 

  });

  //Retorno el concatenado de los dos strings.
  return rangos.bajos+rangos.medios;

}

//Función del proceso master.
const procMaster = ()=>{

  console.log('> SOLUCION NODE-CHALLENGE');
  console.log('> Por Damián Cipolat');
  console.log('');

  //Cargo el array con los datos parseados.
  fullLoadFile(file).then((data)=>{

    //Agrupo por  destino y concepto.
    let groupDestino = groupByType(data.map((line) => splitLine(line)));

    //Aplano un diccionario en un array.
    groupDestino     = planeArray(groupDestino);

    //Separo por grupos los destinos.
    let bloqs        = chunkify(groupDestino, groupDestino.length/nProcs);

    //Creo los workes en base a la cantidad de cpus del equipo.
    for (let i = 1; i <= nProcs; i++)
      cluster.fork();

    //A cada worker le agrego event handler para recibir msgs del children.
    for (const id in cluster.workers){

      console.log('> Creado child',id);

      //Seteo handler.
      cluster.workers[id].on('message',onChildMsg);

      //Envio msg. a cada proceso children el lote completo a procesar.
      cluster.workers[id].send({cmd:'proc-req', data:bloqs[id-1], idProc:id});

      //Estructura para almacenar las respuesta de cada children.
      resultArray[id] = {complete:false, values:null};

    }

    //Libero memoria.
    bloqs        = null;
    groupDestino = null;

  }).catch((err)=>{

    console.log('error app',err);

  });

}

//Función del proceso child.
const procChild = ()=>{

  //Cuando recibo del master un mensaje.
  process.on('message',onMasterMsg);

}

//Bifurco entre master y children.
if (cluster.isMaster)
  procMaster();
else
  procChild();
