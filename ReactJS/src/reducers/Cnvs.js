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
         return state.map(val => val.id !== action.data.cnvId ? //map creates a brand new array
            val : Object.assign({}, val, { title: action.data.title })); //we always want to replace old data NOT mutate it
      case 'ADD_CNV':
         // state.push(action.cnv);
         // return state;
         return state.concat([action.cnv]); //we used concat because it creates a new array while "push" modify the array
      default:
         return state;
   }
}

let prs1 = new Person("clint", ...);
let prs2 = new Person("clint", ...);

if (prs1 === prs2) //you are comparing the references which are different so it woul return false


let prs1 = new Person("clint", ...);
let prs2 = new Person("clint", ...);

if (prs1 === prs2) //you are comparing the references which are the same now

