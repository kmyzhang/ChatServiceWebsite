import * as api from '../api';

export function signIn(credentials, cb) { //these can each be individually imported
   return (dispatch, prevState) => {
      api.signIn(credentials)
      .then((userInfo) => dispatch({type: "SIGN_IN", user: userInfo})) //you are creating an action
      .then(() => {if (cb) cb();}) //most likely to be null, just something to have if you hve another action to complete once all the other stuff is done
   };
}

export function signOut(cb) {
   return (dispatch, prevState) => {
      api.signOut()
      .then(() => dispatch({ type: 'SIGN_OUT' }))
      .then(() => {if (cb) cb();});
   };
}

export function register(data, cb) {
   return (dispatch, prevState) => {
      api.register(data)
      .then(() => {if (cb) cb();}) //will the cb be called regardless of whether there is an error or not? NO, because "then" only occurs for resolved promises, if there is an error , then it will go straight to the catch
      .catch(error => dispatch({type: 'REGISTER_ERR', details: error})); //catch block to handle errors
   };
}

export function updateCnvs(userId, cb) {
   return (dispatch, prevState) => {
      api.getCnvs(userId)
      .then((cnvs) => dispatch({ type: 'UPDATE_CNVS', cnvs }))
      .then(() => {if (cb) cb();});
   };
}

export function addCnv(newCnv, cb) {
   return (dispatch, prevState) => {
      api.postCnv(cnv)
      .then(cnvRsp => dispatch({type: 'ADD_CNV', cnv: newCnv}))
      .then(() => {if (cb) cb();});
   };
}

export function modCnv(cnvId, title, cb) {
   return (dispatch, prevState) => {
      api.putCnv(cnvId, {title})
      .then((cnvs) => dispatch({type: 'UPDATE_CNVS', data: cnvs))
      .then(() => {if (cb) cb();});
   };
}