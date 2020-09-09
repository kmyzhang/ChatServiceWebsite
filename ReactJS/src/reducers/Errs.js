export default function Errs(state = [], action) {
   switch(action.type) {
   case 'LOGIN_ERR':
   case 'REGISTER_ERR':
   case 'ADD_CNV_ERR':
   case 'DEL_CNV_ERR':
   case 'LOAD_MSGS_ERR':
   case 'ADD_MSG_ERR':
   console.log(JSON.stringify(action.details));
      return state.concat(action.details);
   case 'CLEAR_ERRS':
      return [];
   default:
      return state;
   }
}
