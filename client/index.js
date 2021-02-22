import React,{useState} from 'react';
import { render } from 'react-dom';


import axios from 'axios'

const getContainerUrl = async ()=>{
  const {data} = await axios.get('/getsignature') 
  return data.url
}

const uploadFileToBlob= (url,fileSelected)=>{
   
return axios({
  method: 'put',
  url ,
  headers: { 
    'x-ms-blob-type': 'BlockBlob', 
    'Content-Type': 'image/jpeg'
  },
  data : fileSelected
})
}

const ExampleComponent = () => {
  // all blobs in container
  const [blobList, setBlobList] = useState([]);

  // current file to upload into container
  const [fileSelected, setFileSelected] = useState(null);

  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [sasKey, setSasKey] = useState('');
  const [inputKey, setInputKey] = useState(Math.random().toString(36));

  useEffect(()=>{
   getContainerUrl().then(url=> setSasKey(url))
  },[])

  const onFileChange = (event) => {
    // capture file into state
    setFileSelected(event.target.files[0]);
  };

  const onFileUpload = async () => {
    // prepare UI
    setUploading(true);

    // *** UPLOAD TO AZURE STORAGE ***
    const blobsInContainer = await uploadFileToBlob(fileSelected);

    // prepare UI for results
    setBlobList(blobsInContainer);

    // reset state/form
    setFileSelected(null);
    setUploading(false);
    setInputKey(Math.random().toString(36));
  };

  // display form
  const DisplayForm = () => (
    <div>
      <input type="file" onChange={onFileChange} key={inputKey || ''} />
      <button type="submit" onClick={onFileUpload}>
        Upload!
          </button>
    </div>
  )

  // display file name and image
  const DisplayImagesFromContainer = () => (
    <div>
      <h2>Container items</h2>
      <ul>
        {blobList.map((item) => {
          return (
            <li key={item}>
              <div>
                {Path.basename(item)}
                <br />
                <img src={item} alt={item} height="200" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div>
      <h1>Upload file to Azure Blob Storage</h1>
      <h2>sasKey:{sasKey}</h2>
      {storageConfigured && !uploading && DisplayForm()}
      {storageConfigured && uploading && <div>Uploading</div>}
      <hr />
      {storageConfigured && blobList.length > 0 && DisplayImagesFromContainer()}
      {!storageConfigured && <div>Storage is not configured.</div>}
    </div>
  );
}

render(<ExampleComponent />, document.getElementById('app'));
