import React,{useEffect} from 'react';
import { BrowserRouter } from "react-router-dom";
import '../styles.css';
import AppRoutes from './routes';

export default function App() {

  useEffect(()=>{
    const raw = localStorage.getItem("sgc-user-preferences");
    if(!raw) return;
  }) 

  try{
    const parsed = JSON.parse(raw);
    const theme = parsed?.theme === "dark" ? "dark" : "light";
    const fontScale = Number(parsed?.fontScale) || 1;

    document.body.setAttribute("data-theme", theme);
    document.documentElement.style.setProperty("--app-font-scale", String(fontScale));
  } catch{
    //ignore parse error
  }
 
  return (
    <BrowserRouter>
      <div className="flex">
        <main className="flex-1 p-6">
          {<AppRoutes />}
        </main>
      </div>
    </BrowserRouter>
  );
}

