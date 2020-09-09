export default function Msgs(state = [], action) {
   console.log("Msgs  action " + action.type);
   switch (action.type) {
      case 'UPDATE_MSGS': 
         return action.msgs;
      case 'ADD_MSG':
         return state.concat([action.msg]);
      default:
         return state;
   }
}

