# jquery-delorean

jquery-delorean is a jQuery based data binder.

**Disclaimer:** This is **NOT** a final product. jquery-delorean was developed for pure hobbie and studies purposes.

# Feature list:
 * Easy-to-use Databinder between your backend and frontend
 * Bind html elements to JavaScript objects that can be automatcally fetched
 * Real time consistency between JavaScript <-> View
 * Delorean Controllers provide a synchronization middleware for a customized/flexible object binder
 
 
# How to use:
# HTML File Example
1) Import **jquery-delorean** to your html file:
```html
<script type="text/javascript" src="jquery.delorean.js"></script>
```

2) Define a html block (i.e. `<div>`) that correspond to your controller´s content using the **dlr-controller** tag:
```html
<div dlr-controller="ClientController"></div>
```
You can give any name you like to your controller, in this exemple we are using **ClientController**.
The controller´s name is case-sensitive.
It´s possible to give a subname to your controller using the **as** word, i.e:
```html
<div dlr-controller="ClientController as myController"></div>
```
3) Bind HTML **text inputs**, **checkboxes**, **textareas** and **selects** to a specific javascript object:
```html
<div dlr-controller="ClientController as myController">
    <input type="text" dlr-model="myController.Client.Name" />
    <select dlr-model="myController.Client.PhoneList"></select>
    <!-- dlr-model binded to a select tag must be in the format { id: <>, value: <> } -->
    
    <input type="checkbox" dlr-model="myController.Client.IsActive"/>
    <textarea rows="4" cols="50" drl-model="myController.Client.Notes">
</div>
```
You can link those inputs to a plain HTML text by doing:
```html
<div dlr-controller="ClientController as myController">
    ...
    {{myController.Client.Name}}
</div>
```
4) The final HTML block should look like this:
```html
<div dlr-controller="ClientController as myController">
    <input type="text" dlr-model="myController.Client.Name" />
    <select dlr-model="myController.Client.PhoneList"></select>
    <!-- dlr-model binded to a select tag must be in the format { id: <>, value: <> } -->
    
    <input type="checkbox" dlr-model="myController.Client.IsActive"/>
    <textarea rows="4" cols="50" drl-model="myController.Client.Notes">
    {{myController.Client.Name}}
</div>
```

# Javascript File Example
You can populate your HTML in two ways: **Fetching data from the server** and **manually manage your javascript object**

1)  **Fetching data from the server**
```javascript
Delorean.BindController('ClientController')                         
        .ToEndpoint('/client')
        .Using({ id: '158' })
        .Then(function (data, status) {

        }).Sync();
```
***BindController*** block binds the endpoint with a specific controllers previously defined in your HTML.
```swift
BindController(String controllerName)
```
***ToEndpoint*** block sets the endpoint request url for the specified controller.
```swift
ToEndpoint(String endpointUrl)
```
***Using*** block sets the request params.
```swift
Using(Object params)
```
***Then*** block defines a request callback
```swift
Then( Function<Object data, String status> )
```

***Those entire blocks are similar to:***
```javascript
$.ajax({
    url: <endpointUrl>,
    data: <params>,
    dataType: 'json',
    method: 'GET',
    success: function(res) {
        <callback>(res, 'success');
    },
    error: function(res) {
        <callback>(res, 'error');
    }
});
```
    
2)  **Manually manage your javscript objects**

Adding this function to your javascript provides a middleware injection between delorean and your html.
Remember that the function name **MUST** match your controller´s name.
```javascript
function ClientController($scope) {
    $scope.Client = { Name: 'Jhon Rubiks', PhoneList: [{ id:0, value: '(111) 111-1111' }, { id: 1, value:'(222) 222-2222' }], IsActive: true, Notes:'That´s cool' };
}
```
    
### That's it!

## TO DO List
* Add suport for dlr-repeat
* Improve the controller's $scope feature
    
