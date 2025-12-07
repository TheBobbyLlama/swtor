import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Main from './screens/Main/Main';
import Browse from './screens/Browse/Browse';
import ViewProfile from './screens/ViewProfile/ViewProfile';
import Demo from './screens/Demo/Demo';
import Helper from './screens/Helper/Helper';
import Null from './screens/Null/Null';

import ModalManager from './screens/ModalManager/ModalManager';

import { getUrlBase } from './util';
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter basename={getUrlBase()}>
        <Routes>
          <Route path="/" element={<Main />}>
            <Route index element={<Browse />}></Route>
            <Route path="view/:server?/:characterName" element={<ViewProfile />}></Route>
            <Route path="demo" element={<Demo />}></Route>
            <Route path="helper/ie" element={<Helper equinox={true} />}></Route>
            <Route path="helper" element={<Helper />}></Route>
            <Route path="*" element={<Null />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ModalManager />
    </>
  );
}

export default App;
