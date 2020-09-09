export default function Cnvs(state = [], action) {
   switch (action.type) {
      case 'UPDATE_CNVS': // Replace previous cnvs
         return action.cnvs;
      case 'UPDATE_CNV':
         /* Example of wrongness
         state.forEach(val => {
            if (val.id === action.data.cnvId)
               val.title = action.data.title;
         });
         return state;*/
         return state.map(val => val.id !== action.data.cnvId ?
            val : Object.assign({}, val, { title: action.data.title }));
      case 'ADD_CNV':
         return state.concat([action.cnv]);
      default:
         return state;
   }
}
