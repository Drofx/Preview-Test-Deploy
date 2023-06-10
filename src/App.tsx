import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import "./App.css"

function App() {
  
  interface PackegePreviewJson {
    name:string;
    description:string;
    href:string;
  }

  interface RepositorieData extends PackegePreviewJson {
    views:string[]
  }

  const username:string = "drofx";

  const [repositoriesDatabase,setRepositoriesDatabase] = useState<PackegePreviewJson[]>([])

  const isMountedRef = useRef<boolean>(false);

  async function fetchRepositories():Promise<string[]> {
    const repositories = await axios.get(`https://api.github.com/users/${username}/repos`)
      .then(
        response=>response.data.map((item:any) => item.name)
      ).catch((error:any) => console.log(error));
    return repositories
  }

  async function fetchConfigs(repositoryNames:string[]):Promise<void> {
    let database:PackegePreviewJson[] = []
    for (let index = 0; index < repositoryNames.length; index++) {
      try {
          const packagePreviewJson:PackegePreviewJson = await axios.get(
            `https://raw.githubusercontent.com/drofx/${repositoryNames[index]}/main/preview/packegePreview.json`)
            .then(response=>response.data);
          const views:string[] = await axios.get(
            `https://api.github.com/repos/drofx/${repositoryNames[index]}/contents/preview/views`)
            .then(response=>response.data.map((item:any)=>
            `https://raw.githubusercontent.com/drofx/${repositoryNames[index]}/main/preview/views/${item.name}`));

          const data:RepositorieData = {
            ...packagePreviewJson,
            views:views
          }
          database.push(data)
      }
      catch (error) {
        console.log("Diretorio não encontrado.")
      }
      index==repositoryNames.length-1&&setRepositoriesDatabase(database)
    }
  }

  useEffect(() => {
    if (!isMountedRef.current) {
      fetchRepositories().then((data:string[])=>fetchConfigs(data)).catch((error:string[])=>console.log(error))
      isMountedRef.current = true;
    }
  }, []);

  return (
    <div>
      {repositoriesDatabase.map((item:any)=>
      <a className='card' target='_blank' href={item.href}>
          <img src={item.views[0]} alt="" />
          <p>{item.name}</p>    
      </a>
      )}
    </div>
  );
}

export default App;
