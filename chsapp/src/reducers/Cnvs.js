export default function Cnvs(state = [], action) {
   console.log("Cnvs  action " + action.type);
   switch (action.type) {
      case 'UPDATE_CNVS': 
         return action.cnvs;
      case 'UPDATE_CNV':
         return state.map(val => val.id !== action.data.cnvId ? 
          val : Object.assign({}, val, { title: action.data.title })); 
      case 'ADD_CNV':
         return state.concat([action.cnv]); 
     case 'DEL_CNV':
         return state.filter(cnv => cnv.id !== action.cnvId);
      default:
         return state;
   }
}

