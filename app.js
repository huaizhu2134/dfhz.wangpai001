import updateManager from './common/updateManager';
import { getUser } from './services/usercenter/user';
import { USE_MOCK } from './config/api';
import { mockModels } from './mocks/models';

if (USE_MOCK) {
  globalThis.dataModel = mockModels;
} else {
  globalThis.dataModel = null;
}

App({
  onLaunch: function () {
    getUser();
  },
  onShow: function () {
    updateManager();
    
  },
});
