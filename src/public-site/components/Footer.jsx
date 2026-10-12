import { Link } from "react-router-dom";
import { Waves } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

      
          
         
       

        
     

      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 dark:border-slate-800">
        © {new Date().getFullYear()} Marine AI. All rights reserved.
      </div>
    </footer>
  );
}