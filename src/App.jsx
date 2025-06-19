
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './Pages/Home'
import Dashboard from './Pages/Dashboard'
import Analysis2015 from './Pages/Analysis2015'

import Disclaimer from './Pages/Disclaimer'
import Credits from './Pages/Credits'


import Forgot from './Pages/Forgot'
import AdminPage from './Pages/AdminPage'


function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/Analysis2019' element={<Analysis2015 />} />
    
        <Route path='/Disclaimer' element={<Disclaimer />} />
        <Route path='/Credits' element={<Credits />} />

        <Route path='/Forgot' element={<Forgot/>} />

<Route path='/admin' element={<AdminPage/>}/>

      </Routes>
     

    </>
  )
}

export default App
