
import JSzip from 'jszip';
import * as fs from 'node:fs';
import path from 'node:path';


/**
 * https://javascript.plainenglish.io/how-to-create-zip-files-with-node-js-505e720ceee1
 * 
 * @param { string[] } sourcePaths 
 * @param { string } zipFile 
 */
function createZip( sourcePaths, zipFile ){

  const zip = new JSzip();
  try{
    for( let sourcePath of sourcePaths ){
      addPathRecursivelyToZip( zip, "", sourcePath );
    }
    zip.generateNodeStream( { type : 'nodebuffer', streamFiles : true } )
      .pipe( fs.createWriteStream( zipFile ) );
  }catch( err ) {
    console.log( err );
  }
  
}

function addPathRecursivelyToZip( zip, zipDestPath, sourcePath ){

  if( fs.statSync( sourcePath ).isFile() )
    zip.file( zipDestPath, fs.readFileSync( sourcePath ) );
  else{
    let zipDirectory = zip.folder( zipDestPath );
    for( let file of  fs.readdirSync( sourcePath ) ){
      addPathRecursivelyToZip( zipDirectory, 
                              file,
                              path.join( sourcePath, file ) );
    }
  }

}


let args = process.argv.slice(2);
if( args.length != 1 ){
  console.log( "Invocation: deploy.mjs [DIRECTORY]" );
}else{
  console.log(`Zip file creation for the lambdas: ${args[0]}`);
  createZip( [args[0]], `${args[0]}.zip` );
}

