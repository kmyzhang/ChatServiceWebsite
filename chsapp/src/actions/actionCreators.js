import * as api from '../api';

export function signIn(credentials, cb) { 
   return (dispatch, prevState) => {
      api.signIn(credentials)
       .then((userInfo) => dispatch({type: "SIGN_IN", user: userInfo})) 
       .then(() => {if (cb) cb();}) 
       .catch(error => dispatch({type: 'LOGIN_ERR', details: error}));
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
       .then(() => {if (cb) cb();}) 
       .catch(error => dispatch({type: 'REGISTER_ERR', details: error})); 
   };
}

export function updateCnvs(userId, cb) {
   return (dispatch, prevState) => {
      api.getCnvs(userId)
       .then((cnvs) => dispatch({ type: 'UPDATE_CNVS', cnvs }))
       .then(() => {if (cb) cb();})
       .catch(error => dispatch({type: 'LOAD_CNVS_ERR', details: error}));
   };
}

export function addCnv(newCnv, cb) {
   return (dispatch, prevState) => {
      api.postCnv(newCnv)
       .then(cnvRsp => dispatch({type: 'ADD_CNV', cnv: cnvRsp}))
       .then(() => {if (cb) cb();})
       .catch(error => dispatch({type: 'ADD_CNV_ERR', details: error}));
   };
}

export function delCnv(cnvId, cb) {
   return (dispatch, prevState) => {
      api.delCnv(cnvId)
       .then(cnvRsp => dispatch({type: 'DEL_CNV', cnvId: cnvId}))
       .then(() => {if (cb) cb();})
       .catch(error => dispatch({type: 'DEL_CNV_ERR', details: error}));
   };
}

export function modCnv(cnvId, title, cb) {
   return (dispatch, prevState) => {
      api.putCnv(cnvId, {title})
       .then((cnv) => dispatch({type: 'UPDATE_CNV', data: cnv}))
       .then(() => {if (cb) cb();})
       .catch(error => dispatch({type: 'UPDATE_CNV_ERR', details: error}));
   };
}

export function updateMsgs(cnvId, cb) {
   return (dispatch, prevState) => {
      api.getMsgs(cnvId)
       .then((msgs) => dispatch({ type: 'UPDATE_MSGS', msgs }))
       .then(() => {if (cb) cb();})
       .catch(error => dispatch({type: 'LOAD_MSGS_ERR', details: error}));
   };
}

export function addMsg(cnvId, newMsg, cb) {
   return (dispatch, prevState) => {
      api.postMsg(cnvId, newMsg)
       .then(msgRsp => dispatch({type: 'ADD_MSG', msg: msgRsp}))
       .then(() => {if (cb) cb();})
       .catch(error => dispatch({type: 'ADD_MSG_ERR', details: error}));
   };
}

export function loadLikes(msgId, cb) {
   return (dispatch, prevState) => {
      api.getLikes(msgId)
       .then(msgLikes => dispatch({ type: 'UPDATE_MSG_LIKES', msgId: msgId,
       data: msgLikes}))
       .then(() => {if (cb) return cb();})
   };
}

export function addLike(msgId, cb) {
   return (dispatch, prevState) => {
      api.postLike(msgId)
       .then(likeRsp => dispatch({type: 'ADD_LIKE', msgId: msgId,
       data: likeRsp}))
       .then(() => {if (cb) cb();});
   };
}

export function clearErrors(cb) {
   return (dispatch, prevState) => {
      return dispatch({ type: 'CLEAR_ERRS' })
   };
}