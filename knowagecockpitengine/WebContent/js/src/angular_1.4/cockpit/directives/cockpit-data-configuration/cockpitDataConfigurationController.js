angular.module('cockpitModule').controller("datasetManagerController",["$scope","sbiModule_translate","$mdPanel","cockpitModule_datasetServices","cockpitModule_widgetSelection","$mdDialog","cockpitModule_template","cockpitModule_analyticalDrivers","$timeout","sbiModule_user",datasetManagerController]);
angular.module('cockpitModule').controller("documentManagerController",["$scope","sbiModule_translate","$mdPanel","cockpitModule_documentServices","cockpitModule_widgetSelection","$mdDialog","cockpitModule_analyticalDrivers","$timeout",documentManagerController]);
angular.module('cockpitModule').controller("associationGroupController",["$scope","sbiModule_translate","cockpitModule_realtimeServices", associationGroupController]);

function datasetManagerController($scope,sbiModule_translate,$mdPanel,cockpitModule_datasetServices,cockpitModule_widgetSelection,$mdDialog,cockpitModule_template,cockpitModule_analyticalDrivers,$timeout,sbiModule_user){
	$scope.displayDatasetCard=false;
	$timeout(function(){$scope.displayDatasetCard=true;},0);
	
	$scope.datasetTableActions=[
	                             {
					    			label : 'delete',
					    			 icon:'fa fa-trash' ,  
					    			action : function(item,event) {
					    					//if dataset is not used removed
					    					var listDatasetUsed = cockpitModule_datasetServices.getDatasetsUsed();
					    					if(listDatasetUsed.indexOf(item.id.dsId)==-1){
					    						//if it used in association o selection remove it
					    						var associationList=$scope.retryListOfAssociation(item.label)
					    						var currentSelection = cockpitModule_widgetSelection.getCurrentSelections(item.label);

					    						if(associationList.withAssoc.length == 0 && currentSelection[item.label] ==undefined ){
							    					$scope.tmpAvaiableDataset.splice($scope.tmpAvaiableDataset.indexOf(item),1);
					    						}else{
					    							//there is an association 
					    							 var confirm = $mdDialog.confirm()
					    					          .title(sbiModule_translate.load('sbi.cockpit.dataset.warning.association'))
					    					          .textContent(sbiModule_translate.load('sbi.cockpit.dataset.warning.association.message'))
					    					          .ariaLabel('delete')
					    					          .ok(sbiModule_translate.load('sbi.generic.ok'))
					    					          .cancel(sbiModule_translate.load('sbi.generic.cancel'));

					    					    $mdDialog.show(confirm).then(function() {
					    					    	//ok remove all.
					    					    	if(associationList.withAssoc.length != 0){
					    					    		angular.copy(associationList.withoutAssoc,$scope.tmpAssociations);
								    					$scope.tmpAvaiableDataset.splice($scope.tmpAvaiableDataset.indexOf(item),1);

					    					    	}
					    					    	if(currentSelection[item.label] != undefined){
					    					    		//remove selection
					    					    		for(var i =0 ;i< cockpitModule_template.configuration.aggregations.length;i++){
					    					    			var index = cockpitModule_template.configuration.aggregations[i].datasets.indexOf(item.label);
					    					    			if(index !=-1){
					    					    				var keys = Object.keys(cockpitModule_template.configuration.aggregations[i].selection);
					    					    				for(var k in keys){
					    					    					if(keys[k].startsWith(item.label)){
					    					    						delete cockpitModule_template.configuration.aggregations[i].selection[keys[k]];
					    					    					}
					    					    				}
					    					    				//cockpitModule_template.configuration.aggregations[i].datasets.splice(index,1);
					    					    				
					    					    			}
					    					    			
					    					    		}
					    					    		
					    					    	}
					    					    	
					    					    }, function() {
					    					    	//cancel nothing to do
					    					    });
					    						}
					    						

					    					}else{
					    						 $mdDialog.show(
					    							      $mdDialog.alert()
					    							        .parent(angular.element(document.querySelector('#body')))
					    							        .clickOutsideToClose(true)
					    							        .title(sbiModule_translate.load('sbi.cockpit.dataset.impossibledelete'))
					    							        .textContent(sbiModule_translate.load('sbi.cockpit.dataset.impossibledeletecontent'))
					    							        .ariaLabel('Alert Dialog Demo')
					    							        .ok(sbiModule_translate.load('sbi.generic.ok'))
					    							        );
					    					}
					    			 }
	                             }
	                            ];
	 

	 $scope.datasetFunctions={
			 translate:sbiModule_translate,
			 addDataset : function(ev){
				 $scope.addDataset();
			 },
			 selectParameterFromPanel:function(par,classItem){
				 $scope.selectParameterFromPanel(par,classItem);
			 },
			 haveAnaliticalDriver:(Object.keys(cockpitModule_analyticalDrivers).length>0)
	 };
	 
	 $scope.datasetHaveParameter=function(dataset){
		 if(dataset.parameters == undefined){
		 		return false;
		 	}else{
		 		return dataset.parameters.length>0
		 	}
	 }
	 
	 $scope.showNearRealTimeCockpit = sbiModule_user.functionalities.indexOf("NearRealTimeCockpit")>-1;
	 
	 $scope.cockpitDatasetTableColumns=[
		{
			label:" ",
			size:"10",
			name:"parameters",
			hideTooltip:false,
			maxChars:10,
			transformer:function(val,row){
				for(par in val){
					if(val[par].value==undefined || (!angular.isNumber(val[par].value) && val[par].value.trim()=="")){
						return 	'<span>'+
								'<md-tooltip md-direction="top">'+sbiModule_translate.load("sbi.cockpit.parameter.fill")+'</md-tooltip>'+
				        		'<md-icon style="color:red"  md-font-icon="fa fa-times-circle"></md-icon>'+
				        		'</span>';
				      
					}
				}
				return "";
			}
		},
        {
        	label:"Label",
        	name:"label",
        	static:true
        },
        {
        	label:"Name",
        	name:"name",
        	static:true
        }];
	 if($scope.showNearRealTimeCockpit){
		 $scope.cockpitDatasetTableColumns.push(
			{
				label:"Use Cache",
				name:"usacache",
				template:"<md-checkbox ng-init='row.useCache=row.useCache==undefined? true : row.useCache' ng-model='row.useCache' aria-label='usaCache'></md-checkbox>",
				static:true
			},
			{
				label:"Frequency (seconds)",
				name:"freq",
				static:true,
				template:"<md-input-container style='margin:0' ng-show='row.useCache!=true' md-no-float class='md-block'>"+
						"<input type='number' ng-init='row.frequency=row.frequency==undefined? 0 : row.frequency' min='0' ng-model='row.frequency' placeholder='Frequency'>"+
						"</md-input-container>"
			});
	 }
	  
	 $scope.addDataset=function(){ 
		 cockpitModule_datasetServices.addDataset("cockpitDataConfig",$scope.tmpAvaiableDataset,true);
	 }
	
	 $scope.selectParameterFromPanel=function(par,classItem){
		 var position = $mdPanel.newPanelPosition()
	      .relativeTo('.'+classItem)
	      .addPanelPosition($mdPanel.xPosition.ALIGN_START, $mdPanel.yPosition.ALIGN_BOTTOMS);
 
		 var config = {
				    attachTo: angular.element(document.getElementById("cockpitDataConfig")) ,
				    controller: function($scope,parameter,cockpitModule_analyticalDrivers,mdPanelRef){
				    	var parameters = {};
				    	var suffix = "_description";
				    	for (var property in cockpitModule_analyticalDrivers) {
				    	    if (cockpitModule_analyticalDrivers.hasOwnProperty(property) && property.endsWith(suffix)) {
				    	    	parameters[property.substring(0,property.length - suffix.length)] = cockpitModule_analyticalDrivers[property];
				    	    }
				    	}
				    	$scope.cockpitModule_analyticalDrivers = parameters;
				    	
				    	$scope.addParameter=function(par){
				    		parameter.value="$P{"+par+"}"
				    		mdPanelRef.close();
							$scope.$destroy();
				    	}
				    	
				    },
				    template:
				    	'<md-content style="max-height: 300px;overflow-y: auto;"><md-list><md-list-item ng-repeat="(key,val) in cockpitModule_analyticalDrivers" ng-click="addParameter(key)">{{key}}</md-list-item></md-list></md-content>',
				    position: position,
				    locals: {parameter:par },
				    clickOutsideToClose: true,
				    escapeToClose: true,
				    focusOnOpen: false,
				    panelClass: 'sheetMenuPanel',
				    zIndex: 150
				  };

				  $mdPanel.open(config);
	 }
	
}

function documentManagerController($scope,sbiModule_translate,$mdPanel,cockpitModule_documentServices,cockpitModule_widgetSelection,$mdDialog,cockpitModule_analyticalDrivers,$timeout ){
	$scope.displayDocumentCard=false;
	$timeout(function(){$scope.displayDocumentCard=true;},0);
	
	$scope.documentTableActions=[
	                             {
					    			label : 'delete',
					    			 icon:'fa fa-trash' ,  
					    			action : function(item,event) {
					    				var listDocumentUsed = cockpitModule_documentServices.getDocumentsUsed();
					    				if(listDocumentUsed.indexOf(item.DOCUMENT_ID)==-1){
					    					//if it used in association o selection remove it
				    						var associationList=$scope.retryListOfAssociation(item.DOCUMENT_LABEL)

				    						if(associationList.withAssoc.length == 0 ){
				    							$scope.tmpAvaiableDocument.splice($scope.tmpAvaiableDocument.indexOf(item),1);
				    						}else{

				    							//there is an association 
				    							 var confirm = $mdDialog.confirm()
				    							 .title(sbiModule_translate.load('sbi.cockpit.document.warning.association'))
				    					         .textContent(sbiModule_translate.load('sbi.cockpit.document.warning.association.message'))
				    					          .ariaLabel('delete')
				    					          .ok(sbiModule_translate.load('sbi.generic.ok'))
					    					       .cancel(sbiModule_translate.load('sbi.generic.cancel'));

				    					    $mdDialog.show(confirm).then(function() {
				    					    	//ok remove all.
				    					    	if(associationList.withAssoc.length != 0){
				    					    		angular.copy(associationList.withoutAssoc,$scope.tmpAssociations);
							    					$scope.tmpAvaiableDocument.splice($scope.tmpAvaiableDocument.indexOf(item),1);
				    					    	}
				    					    });
				    						
				    						}
					    				}else{

				    						 $mdDialog.show(
				    							      $mdDialog.alert()
				    							        .parent(angular.element(document.querySelector('#body')))
				    							        .clickOutsideToClose(true)
				    							        .title(sbiModule_translate.load('sbi.cockpit.document.impossibledelete'))
				    							        .textContent(sbiModule_translate.load('sbi.cockpit.document.impossibledeletecontent'))
				    							        .ariaLabel('Alert Dialog Demo')
				    							        .ok(sbiModule_translate.load('sbi.generic.ok'))
				    							        );
				    					
					    				}
					    				
					    			 }
	                             }
	                            ];
	 $scope.documentFunctions={
			 translate:sbiModule_translate,
			 addDocument : function(ev){
				 $scope.addDocument();
			 },
			 selectParameterFromPanel:function(par,classItem){
				 $scope.selectParameterFromPanel(par,classItem);
			 },
			 haveAnaliticalDriver:(Object.keys(cockpitModule_analyticalDrivers).length>0)
	 };
	 $scope.documentHaveParameter=function(doc){
		 return doc.objParameter.length>0
	 }
	 
	 $scope.cockpitDocumentTableColumns=[
	                                    {
	                                    	label:"Label",
	                                    	name:"DOCUMENT_LABEL",
	                                    	static:true
	                                    },
	                                    {
	                                    	label:"Name",
	                                    	name:"DOCUMENT_NAME",
	                                    	static:true
	                                    }
	                                    ]
	 
	  
	 $scope.addDocument=function(){
		 cockpitModule_documentServices.addDocument("cockpitDataConfig",$scope.tmpAvaiableDocument,true);
	 }
	
	 $scope.selectParameterFromPanel=function(par,classItem){
		 var position = $mdPanel.newPanelPosition()
	      .relativeTo('.'+classItem)
	      .addPanelPosition($mdPanel.xPosition.ALIGN_START, $mdPanel.yPosition.ALIGN_BOTTOMS);
 
		 var config = {
				    attachTo: angular.element(document.getElementById("cockpitDataConfig")) ,
				    controller: function($scope,parameter,cockpitModule_analyticalDrivers,mdPanelRef){
				    	$scope.cockpitModule_analyticalDrivers=cockpitModule_analyticalDrivers;
				    	$scope.addParameter=function(par){
				    		parameter.value="$P{"+par+"}"
				    		mdPanelRef.close();
							$scope.$destroy();
				    	}
				    	
				    },
				    template:
				    	'<md-content style="max-height: 300px;overflow-y: auto;"><md-list><md-list-item ng-repeat="(key,val) in cockpitModule_analyticalDrivers" ng-click="addParameter(key)">{{key}}</md-list-item></md-list></md-content>',
				    position: position,
				    locals: {parameter:par },
				    clickOutsideToClose: true,
				    escapeToClose: true,
				    focusOnOpen: false,
				    panelClass: 'sheetMenuPanel',
				    zIndex: 150
				  };

				  $mdPanel.open(config);
	 }
}

function associationGroupController($scope,sbiModule_translate,cockpitModule_realtimeServices){
	$scope.realtimeServices=cockpitModule_realtimeServices;
	$scope.rtData=[];
	$scope.$on("refreshFrequencyRTData",function(){
		angular.copy([],$scope.rtData);
		angular.forEach($scope.tmpAggregations,function(aggreg){
			this.push(cockpitModule_realtimeServices.getRealTimeDatasetFromList(aggreg.datasets,$scope.tmpAvaiableDataset));
		},$scope.rtData)
		
	})
}

function cockpitDataConfigurationController($scope,$rootScope,sbiModule_translate,cockpitModule_template,cockpitModule_datasetServices,sbiModule_restServices,$mdPanel,$mdDialog,mdPanelRef,cockpitModule_widgetSelection,cockpitModule_documentServices,cockpitModule_widgetServices,cockpitModule_widgetSelectionUtils,cockpitModule_templateServices,cockpitModule_properties,sbiModule_user){			
	
	// see if smart detection is enabled
	$scope.showSmartDetection = (sbiModule_user.functionalities.indexOf("DatasetAssociationSmartDetection")>-1)? true:false;
	
	$scope.showNearRealTimeCockpit = sbiModule_user.functionalities.indexOf("NearRealTimeCockpit")>-1;

	$scope.translate=sbiModule_translate;
		    	 $scope.baseScriptPath=baseScriptPath;
		    	 $scope.cockpitModule_template=cockpitModule_template;
		    	 $scope.datasetList=cockpitModule_datasetServices.getDatasetList();
		    	 $scope.utils = {};
		    	  //clone de avaiable dataset to reset it if user cancel the dialog
		    	  $scope.tmpAvaiableDataset=[];
		    	  angular.copy(cockpitModule_datasetServices.getAvaiableDatasets(),$scope.tmpAvaiableDataset);
		    	  
		    	  //clone de avaiable document to reset it if user cancel the dialog
		    	  $scope.tmpAvaiableDocument=[];
		    	  angular.copy(cockpitModule_documentServices.getAvaiableDocuments(),$scope.tmpAvaiableDocument);

		    	  $scope.tmpAssociations=[];
		    	  angular.copy(cockpitModule_template.configuration.associations,$scope.tmpAssociations);
		    	 
		    	  $scope.tmpAggregations=[];
		    	  angular.copy( cockpitModule_template.configuration.aggregations,$scope.tmpAggregations);
		    	  
		    	  var selectionWatch=$scope.$watch("tmpAssociations",function(newVal,oldVal){
		    		  if(!angular.equals(newVal,oldVal) && (  $scope.utils.currentAss==undefined ||   $scope.utils.currentAss.id==undefined)){
		    			 cockpitModule_widgetSelection.getAssociations(false,{associations:$scope.tmpAssociations,tmpAggregations:$scope.tmpAggregations,currentDsList:$scope.tmpAvaiableDataset});
		    		  }
		    	  },true);
		    	  
		    	  $scope.$watchCollection('tmpAvaiableDataset', function(newDatasets, oldDatasets) {
		    		  if($scope.tmpAutodetectResults){
		    			  console.log("$scope.tmpAutodetectResults = null;")
		    			  $scope.tmpAutodetectResults = null;
		    		  }
		    		});
		    	  

		    	  $scope.saveConfiguration =function(){
		    		  if($scope.utils.currentAss!=undefined && $scope.utils.currentAss.id != undefined ){
		    				$scope.tmpAssociations.push($scope.utils.currentAss);
		    				$scope.doSave();
		    			}
		    			else if($scope.utils.currentAss!=undefined &&  $scope.utils.currentAss.fields.length>0){
		    				var confirm = $mdDialog.confirm()
		    				.title('You have an unsaved association')
		    				.textContent('If you save you will loose the association. Are you Sure?')
		    				.ariaLabel('Lucky day')
		    				.ok('Yes')
		    				.cancel('No');

		    				$mdDialog.show(confirm).then(function() {
		    					$scope.doSave();
		    				}, function() {
		    					return;
		    				});
		    			}else{
		    				$scope.doSave();
		    			}
		    	  }
		    	  $scope.doSave=function(){
		    	  	 if($scope.checkDataConfiguration()){
		    	  		 var datasetParChange=false;
		    	  		var datasetParameterChanged={};
		    	  		var oldDs=cockpitModule_datasetServices.getAvaiableDatasets();
		    	  		if(!angular.equals(oldDs,$scope.tmpAvaiableDataset)){
		    	  			angular.forEach($scope.tmpAvaiableDataset,function(newDs){
		    	  				for(var i=0;i<oldDs.length;i++){
		    	  					if(oldDs[i].id.dsId==newDs.id.dsId){
		    	  						if(!angular.equals(oldDs[i].parameters,newDs.parameters) || oldDs[i].frequency!=newDs.frequency || oldDs[i].useCache!=newDs.useCache){
		    	  							datasetParameterChanged[newDs.label]=newDs.id.dsId;
		    	  							datasetParChange=true;
		    	  						}
		    	  						break;
		    	  					}
		    	  				}
		    	  				 
		    	  			})
		    	  			cockpitModule_datasetServices.setAvaiableDataset($scope.tmpAvaiableDataset);
		    	  		} 
		    	  		var docParChange=false;
		    	  		var documentParameterChanged={};
		    	  		var oldDoc=cockpitModule_documentServices.getAvaiableDocuments();
		    	  		if(!angular.equals(oldDoc,$scope.tmpAvaiableDocument)){
		    	  			
		    	  			angular.forEach($scope.tmpAvaiableDocument,function(newDoc){
		    	  				for(var i=0;i<oldDoc.length;i++){
		    	  					if(oldDoc[i].DOCUMENT_ID==newDoc.DOCUMENT_ID){
		    	  						if(!angular.equals(oldDoc[i].objParameter,newDoc.objParameter)){
		    	  							documentParameterChanged[newDoc.DOCUMENT_LABEL]=newDoc.DOCUMENT_ID;
		    	  							docParChange=true;
		    	  						}
		    	  						break;
		    	  					}
		    	  				}
		    	  				 
		    	  			})
		    	  			
		    	  			
		    	  			
		    	  			cockpitModule_documentServices.setAvaiableDocument($scope.tmpAvaiableDocument);
		    	  		} 

		    	  		angular.copy($scope.tmpAssociations,cockpitModule_template.configuration.associations);
		    		  
		    		  if(!angular.equals($scope.tmpAggregations,cockpitModule_template.configuration.aggregations)){
		    			  //remove from list of datasetParameterChanged the dataset present in aggregation
		    			  angular.forEach($scope.tmpAggregations,function(aggr){
		    				  angular.forEach(aggr.datasets,function(ds){
		    					  delete datasetParameterChanged[ds];
		    					  delete documentParameterChanged[ds];
		    				  })
		    			  })
		    			  
		    			  var haveSel=false;
		    			  for(var i=0;i<cockpitModule_template.configuration.aggregations.length;i++){
		    				  if(Object.keys(cockpitModule_template.configuration.aggregations[i].selection).length>0){
		    					  haveSel=true;
		    					  break;
		    				  }
		    			  }
		    			  
		    			  angular.copy($scope.tmpAggregations,cockpitModule_template.configuration.aggregations);
		    				var dsNotInCache = cockpitModule_templateServices.getDatasetAssociatedNotUsedByWidget();
	    					for(var l=0;l<dsNotInCache.length;l++){
	    						if(cockpitModule_properties.DS_IN_CACHE.indexOf(dsNotInCache[l])!=-1){
	    							dsNotInCache.splice(l,1);
	    							l--;
	    						}
	    					}
	    					
	    					if(dsNotInCache.length>0){
	    						cockpitModule_datasetServices.addDatasetInCache(dsNotInCache)
	    						.then(function(){
	    							cockpitModule_widgetSelection.getAssociations((haveSel || datasetParChange || docParChange ));
								});
	    					}else{
	    						cockpitModule_widgetSelection.getAssociations((haveSel || datasetParChange || docParChange ));
	    					}
		    		  }
	    			  
		    		  if(Object.keys(datasetParameterChanged).length>0 || Object.keys(documentParameterChanged).length>0){
	    				  //manually update of widget
	    				  $rootScope.$broadcast('WIDGET_EVENT','PARAMETER_CHANGE',{dsList:datasetParameterChanged,docList:documentParameterChanged});
	    			  }
		    		  
		    		  $rootScope.$broadcast("WIDGET_EVENT","UPDATE_FROM_CLEAN_CACHE",null);	
		    		  mdPanelRef.close();
		    		  selectionWatch();
		    		  $scope.$destroy();
		    		  }
		    	  }
		    	  $scope.cancelConfiguration=function(){
		    		  mdPanelRef.close();
		    		  selectionWatch();
		    		  $scope.$destroy();
		    	  }
		    	  
		    	  $scope.checkDataConfiguration=function(){
		    		  var errors=[];
		    		  //check errors in dataset parameter
		    		  if(document.querySelectorAll("#cockpit-dataset .fa-times-circle").length>0){
		    			  errors.push(sbiModule_translate.load("sbi.cockpit.save.data.configuration.dataset.parameter.error"));
		    		  }
//		    		  //check errors in document parameter
//		    		  if(document.querySelectorAll("#cockpit-document .fa-times-circle").length>0){
//		    			  errors.push(sbiModule_translate.load("sbi.cockpit.save.data.configuration.document.parameter.error"));
//		    		  }
		    		  
		    		  if(errors.length>0){
		    			  $mdDialog.show(
		    				      $mdDialog.alert()
		    				        .clickOutsideToClose(true)
		    				        .title(sbiModule_translate.load("sbi.cockpit.save.data.configuration.error"))
		    				        .htmlContent(errors.join("</br>"))
		    				        .ariaLabel('Alert Dialog ')
		    				        .ok('ok')
		    				    );
		    				  
		    			  return false;
		    		  }else{
		    			  return true;
		    		  }
		    	  }
		    	 
		    	$scope.retryListOfAssociation = function(itemLabel){
		    			 var array = [];
		    			 var flag = true;
		    			 var arrayWithoutAssociation = [];
		    			 for(var i=0;i<$scope.tmpAssociations.length;i++){
		    				 flag = true;
		    					var assoc = $scope.tmpAssociations[i];
		    					for(var j=0;j<assoc.fields.length;j++){
		    						if(assoc.fields[j].store == itemLabel){
		    							flag = false;
		    							//there is an association 
		    							array.push(assoc);
		    						}
		    					}
		    					if(flag){
		    						arrayWithoutAssociation.push(assoc);
		    					}
		    				}
		    			 return {"withAssoc": array, "withoutAssoc" : arrayWithoutAssociation};
		    		 }
		    	 
		    	$scope.refreshFrequencyRTData=function(){
		    		$scope.$broadcast("refreshFrequencyRTData")
		    	}
};

