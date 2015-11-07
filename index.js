var Promise          = require('ember-cli/lib/ext/promise');
var child_process    = require('child_process');
var DeployPluginBase = require('ember-cli-deploy-plugin');

var tagRepo = function(tag, revision, message) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    child_process.exec('git tag -f ' + tag + ' ' + revision, function(e) {
      if (e) {
        _this.log(e, { color: 'red' });
        reject(e);
      } else {
        _this.log(message);
        resolve();
      }
    });
  });
};

module.exports = {
  name: 'ember-cli-deploy-git-tag',

  createDeployPlugin: function(options) {
    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      defaultConfig: {
        deployTag: function(context) {
          var revisionKey = context.revisionData.revisionKey;
          var deployTarget = context.deployTarget;
          return ["deploy", deployTarget, revisionKey].join('-');
        },
        activateTag: function(context) {
          return context.deployTarget;
        }
      },

      configure: function(/*context*/) {
        this.log('validating config', { verbose: true });
        ['deployTag', 'activateTag'].forEach(this.applyDefaultConfigProperty.bind(this));
        this.log('config ok', { verbose: true });
      },

      didDeploy: function(context) {
        var tag = this.readConfig("deployTag");
        if (tag == null) {
          return;
        }

        var revision = context.revisionData.revisionKey;
        return tagRepo.apply(this, [tag, revision, "tagged " + tag + " as deployed"]);
      },

      didActivate: function(context) {
        var tag = this.readConfig("activateTag");
        if (tag == null) {
          return;
        }
        
        var revision = context.revisionData.activatedRevisionKey;
        return tagRepo.apply(this, [tag, revision, "tagged " + tag + " as activated"]);
      }
    });

    return new DeployPlugin();
  }
};
