export default function Likes(state = [], action) {
   console.log("Likes  action " + action.type);
   switch (action.type) {
      case 'ADD_MSG_LIKES':
         return state.concat([]);
      case 'UPDATE_LIKES': 
         var newLikes = [];
         for (var i = 0; i < action.num; i++) {
            newLikes.push([])
         }
         return newLikes;
      case 'UPDATE_MSG_LIKES':
         let newState = state.slice(0);

         newState[action.msgId] = action.data;
         return newState;
      case 'ADD_LIKE':
         let newState2 = state.slice(0);

         newState2[action.msgId] = action.data;
         return newState2; 
      default:
         return state;
   }
}

