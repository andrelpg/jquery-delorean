(function () {  
    
    this.DeloreanClass = function () {
        this.delorean_value = null;
        this.delorean_hidden = null;
        this.delorean_html = null;
        this.delorean_select = null;
        this.delorean_container = null;
        this.request_data = {};
        this.controllerList = [];

        this.controllerObject = null;

        this.virtual_models = [];

        this.self = this;

        StartControllerScopes(this.controllerList);
        StartInputObservers();
        StartSelectObservers();
        
    }
    
    DeloreanClass.prototype.BindController = function (controllerName) {
        if ($.type(controllerName) !== 'string') {
            console.error('DeloreanController -> invalid controller name.');
            return;
        }

        var controllerObject = $('[dlr-controller^="' + controllerName + ' "]');
        var controllerModels = controllerObject.find('[dlr-model]');

        var controller = this.controllerList.filter(function (el) { return el.name == controllerName })[0];

        if (controller != null) {
            this.controllerObject = controller;
        } else {
            this.controllerObject = { id: new Date().getTime(), name: controllerName, element: controllerObject, models: controllerModels, request: {}, callback: {}, data: {}, $scope: {} };
        }
        


        return this;
    }

    DeloreanClass.prototype.ToEndpoint = function (controllerUrl) {
        if ($.type(controllerUrl) !== 'string') {
            console.error('DeloreanController -> invalid controller endpoint.');
            return;
        }

        this.controllerObject.request.url = controllerUrl;
        return this;
    }

    DeloreanClass.prototype.Using = function (params) {
        if ($.type(params) !== 'object') {
            console.error('DeloreanController -> invalid endpoint params.');
            return;
        }

        this.controllerObject.request.params = params;
        return this;
    }

    DeloreanClass.prototype.Then = function (callback) {
        if ($.type(callback) !== 'function') {
            console.error('DeloreanController -> invalid callback function.');
            return;
        }

        this.controllerObject.callback = callback;
        this.controllerObject.identifier = this.controllerObject.element.attr('dlr-controller').split(this.controllerObject.name + ' as ')[1];
        this.controllerList.push(this.controllerObject);

        return this;
    }
    
    DeloreanClass.prototype.Sync = function (controllerName) {

        var obj;
        if (controllerName == null) {
            obj = this.controllerObject;
        } else {
            obj = this.controllerList.filter(function (el) {
                return el.name == controllerName;
            });

            if (obj.length == 0) {
                console.error('DeloreanController -> invalid controller.');
                return;
            }

            obj = obj[0];
        }

        $.ajax({
            type: "GET",
            url: obj.request.url,
            data: obj.request.params,
            dataType: "json",
            success: function (response) {
                DeloreanValues(response, obj.models, obj.identifier);
                obj.data = response;
                obj.callback(response, 'success')
            },
            error: function (response) {
                obj.callback(response, 'error')
            }
        });
    }

    function DeloreanValues (datasource, models, identifier) {
        this.delorean_value = models;
        this.delorean_value.each(function (i, el) {
            var model_id = $(el).attr('dlr-model');

            if (model_id == null) console.error("DeloreanValue Error -> dlr-value without identifier");

            if (identifier != '')
                model_id = model_id.replace(identifier + '.', '');

            var model_id_split = model_id.split('.');

            if (model_id_split.length == 0) {
                setDeloreanValue(datasource[model_id], el);
            } else {
                var cascade_value = datasource;
                model_id_split.forEach(function (token) {
                    if ($.type(cascade_value[token]) === 'object') {
                        cascade_value = cascade_value[token];
                    } else if (datasource[token] !== 'object' || datasource[token] != null) {
                        SetDeloreanValue(cascade_value[token], el);
                    }
                });
            }
        });
    };

    function SetDeloreanValue (value, el) {
        if (value != null) {
            if (($(el).is('input') || $(el).is('textarea')) && $(el).val() != value) {
                $(el).val(value);
            } else if ($(el).is('select')) {
                if ($.type(value) === 'array') {
                    value.forEach(function (el) {
                        $(el).append('<option value="' + (value.id != null ? value.id : '') + '">' + (value.name) + '</option>');
                    });
                } else {
                    console.error("dlr-model for <select> must be an array!")
                    return;
                }
            } else if ($(el).is('input[type="checkbox"')) {
                if (value == true) {
                    $(el).attr("checked", true);
                } else {
                    $(el).attr("checked", false);
                }
            }
            /*
            else if ($(el).is('input[type="checkbox"')) {
                // Missing implementation for radiobuttons
            }
            */
        }
    };

    function StartInputObservers() {
        var modelList = $('input[dlr-model]');
        var targetEl = [];
        modelList.each(function (index, el) {
            var modelId = $(el).attr('dlr-model');
            var elArray = $(':contains("{{' + modelId + '}}")');
            var targetEl = $(elArray[elArray.length - 1]);
            var targetHtml = targetEl.html();
            $(el).unbind('keyup').on('keyup', function () {
                targetEl.each(function (i, e) {
                    $(e).html(targetHtml.replace('{{' + modelId + '}}', $(el).val()));
                });
            });
            $(el).trigger('keyup');
        });

    };

    function StartSelectObservers() {
        var modelList = $('select[dlr-model]');
        modelList.each(function (index, el) {
            var modelId = $(el).attr('dlr-model');
            var elArray = $(':contains("{{' + modelId + '}}")');
            var targetEl = $(elArray[elArray.length-1]);
            var targetHtml = targetEl.html();
            $(el).unbind('change').on('change', function () {
                targetEl.each(function (i, e) {
                    $(e).html(targetHtml.replace('{{' + modelId + '}}', $(el).val()));
                });
            });
            $(el).trigger('change');
        });
    }

    function StartControllerScopes(globalCtrlList) {
        var controllerList = $('[dlr-controller]');
        controllerList.each(function (i, controller) {
            var controllerName = $(controller).attr('dlr-controller').split(' as ')[0];
            var object = { id: new Date().getTime(), name: controllerName, element: $(controller), models: $(controller).find('[dlr-model]'), request: {}, callback: {}, data: {}, $scope: {} };
            globalCtrlList.push(object);
            window[controllerName](object.$scope);
            var identifier = object.identifier = $(controller).attr('dlr-controller').split(object.name + ' as ')[1];
            DeloreanValues(object.$scope, object.models, (identifier == null ? '' : identifier));
            // add support for {{yyy}}
        });
    }

    
    
}());

var Delorean = new DeloreanClass();