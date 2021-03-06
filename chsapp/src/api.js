﻿// Orderly interface to the REST server, providing:
// 1. Standard URL base
// 2. Standard headers to manage CORS and content type
// 3. Guarantee that 4xx and 5xx results are returned as
//    rejected promises, with a payload comprising an
//    array of user-readable strings describing the error.
// 4. All successful post operations return promises that
//    resolve to a JS object representing the newly added
//    entity (all fields, not just those in the post body)
//    The only exception is Prss POST which cannot do this
//    due to login requirements.  Prss POST does the best
//    it can by returning the object it just added, augmented
//    with the proper ID.
// 5. Signin and signout operations that retain relevant
//    sessionId data.  Successful signin returns promise 
//    resolving to newly signed in user.

const baseURL = "http://localhost:3001/";
const headers = new Headers();
var sessionId;

headers.set('Origin', 'http://localhost:3000');
headers.set('Content-Type', 'application/JSON');
headers.set('Access-Control-Request-Headers', 'Content-Type')

const reqConf = {
   headers: headers,
   credentials: 'include',
};

function safeFetch(endpoint, body) {
	return new Promise((resolve, reject) => {
		fetch(baseURL + endpoint, body)
		 .then(response => {
			 if (!response.ok) {
				 if (response.status === 400) {
					response.json().then(data => {
						return reject(data.map(value => {
							if (value.params != null)
								return errMap.en[value.tag] + value.params[0]
							else
								return errMap.en[value.tag];
						}));
					});
				 }
				 else if (response.status === 401 || response.status === 403)
				    return reject();
			 } else {
				 resolve(response);
			 }
       })
       .catch(error => {
		    return reject(["Server Connect Error"]);
		 })
   })
}

// Helper functions for the comon request types, automatically
// adding verb, headers, and error management.
export function post(endpoint, body) {
	return safeFetch(endpoint, {
		method: 'POST',
		body: JSON.stringify(body),
		...reqConf
   });
}

export function put(endpoint, body) {
   return safeFetch(endpoint, {
   	method: 'PUT',
   	body: JSON.stringify(body),
      ...reqConf
   });
}

export function get(endpoint) {
   return safeFetch(endpoint, {
      method: 'GET',
      ...reqConf
   });
}

export function del(endpoint) {
   return safeFetch(endpoint, {
      method: 'DELETE',
      ...reqConf
   });
}

// Functions for performing the api requests

/**
 * Sign a user into the service, returning a promise of the 
 * user data
 * @param {{email: string, password: string}} cred
 */
export function signIn(cred) {
	var prId = 0;
	
	return post("Ssns", cred)
	 .then(response => {
		 let location = response.headers.get("Location").split('/');
         sessionId = location[location.length - 1];
         return get("Ssns/" + sessionId)
	 })
	 .then(response => response.json())   
    .then(body => {prId = body.prsId; return get('Prss/' + body.prsId)})
    .then(userResponse => userResponse.json())
    .then(rsp => {rsp[0].id = prId; return rsp[0];});
}

/**
 * @returns {Promise} result of the sign out request
 */
export function signOut() {
	return del("Ssns/" + sessionId);
}

/**
 * Register a user
 * @param {Object} user
 * @returns {Promise resolving to new user}
 */
export function register(user) {
   return post("Prss", user)
}

/**
 * @returns {Promise} json parsed data
 */
export function getCnvs(userId) {
	return get("Cnvs" + (userId ? "?owner=" + userId : ""))
    .then((res) => res.json())
}

export function putCnv(id, body) {
   return put(`Cnvs/${id}`, body)
}

export function delCnv(id) {
   return del(`Cnvs/${id}`);
}

export function postCnv(body) {
   return post('Cnvs', body).then(rsp => {
		let location = rsp.headers.get("Location").split('/');
      return get(`Cnvs/${location[location.length-1]}`);
   })
   .then(rsp => rsp.json());
}

export function getMsgs(cnvId) {
	return get("Cnvs/" + cnvId + "/Msgs")
    .then((res) => res.json())
}

export function postMsg(cnvId, body) {
   let msgId = 0;

	return post("Cnvs/" + cnvId + "/Msgs", body)
	 .then(rsp => {
		 let location = rsp.headers.get("Location").split('/');
		 msgId = location[location.length-1];
		 return get(`Msgs/${location[location.length-1]}`);
    })
    .then(response => response.json()) 
    .then(rsp => {rsp.id = msgId; return rsp;});
}

export function getLikes(msgId) {
   return get("Msgs/" + msgId + "/Likes?num=5")
    .then((res) => res.json())
}

export function postLike(msgId) {
	return post("Msgs/" + msgId + "/Likes")
	 .then(rsp => { return get("Msgs/" + msgId + "/Likes?num=5"); })
	 .then(rsp => rsp.json());
}

export function clearErrors() {
   return new Promise((resolve, reject) => {})
}

const errMap = {
   en: {
      missingField: 'Field missing from request: ',
      badValue: 'Field has bad value: ',
      notFound: 'Entity not present in DB',
   	badLogin: 'Email/password combination invalid',
      dupEmail: 'Email duplicates an existing email',
      noTerms: 'Acceptance of terms is required',
      forbiddenRole: 'Role specified is not permitted.',
      noOldPwd: 'Change of password requires an old password',
      oldPwdMismatch: 'Old password that was provided is incorrect.',
      dupTitle: 'Conversation title duplicates an existing one',
      dupEnrollment: 'Duplicate enrollment',
      forbiddenField: 'Field in body not allowed.',
		queryFailed: 'Query failed (server problem).'
	},
   es: {
		missingField: '[ES] Field missing from request: ',
		badValue: '[ES] Field has bad value: ',
		notFound: '[ES] Entity not present in DB',
		badLogin: '[ES] Email/password combination invalid',
		dupEmail: '[ES] Email duplicates an existing email',
		noTerms: '[ES] Acceptance of terms is required',
		forbiddenRole: '[ES] Role specified is not permitted.',
		noOldPwd: '[ES] Change of password requires an old password',
		oldPwdMismatch: '[ES] Old password that was provided is incorrect.',
		dupTitle: '[ES] Conversation title duplicates an existing one',
		dupEnrollment: '[ES] Duplicate enrollment',
		forbiddenField: '[ES] Field in body not allowed.',
		queryFailed: '[ES] Query failed (server problem).'
   },
   swe: {
		missingField: 'Ett fält saknas: ',
		badValue: 'Fält har dåligt värde: ',
		notFound: 'Entitet saknas i DB',
		badLogin: 'Email/lösenord kombination ogilltig',
		dupEmail: 'Email duplicerar en existerande email',
		noTerms: 'Villkoren måste accepteras',
		forbiddenRole: 'Angiven roll förjuden',
		noOldPwd: 'Tidiagre lösenord krav för att updatera lösenordet',
		oldPwdMismatch: 'Tidigare lösenord felaktigt',
		dupTitle: 'Konversationstitel duplicerar tidigare existerande titel',
		dupEnrollment: 'Duplicerad inskrivning',
		forbiddenField: 'Förbjudet fält i meddelandekroppen',
		queryFailed: 'Förfrågan misslyckades (server problem).'
   }
}

/**
 * @param {string} errTag
 * @param {string} lang
 */
export function errorTranslate(errTag, lang = 'en') {
   return errMap[errTag] || 'Unknown Error!';
}
