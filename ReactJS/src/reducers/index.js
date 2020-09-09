import { combineReducers } from 'redux';

import Prss from './Prss';
import Cnvs from './Cnvs';
import Errs from './Errs';

const rootReducer = combineReducers({Prss, Cnvs, Errs}); //ES6 = {"Prss": Prss, "Cnvs": Cnvs}

export default rootReducer;