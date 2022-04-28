var error_inf={};

	function asignColors (error_arr){
		//Assign colors according to received error_arr
		var	colors_arr = [];
		for(var i=0, len=error_arr.length; i<len; i++){ 
			if(error_arr[i]==0){
				colors_arr[i]='5C636E';
			}else if(error_arr[i]==1){
				colors_arr[i]='#005dff';
			}else if(error_arr[i]==2){
				colors_arr[i]='#cf00ff';
			}else if(error_arr[i]==3){
				colors_arr[i]='#ff0000';
			}
			else{
				colors_arr[i]='#000000';
			}
		}
		return colors_arr
	}


	function assignDate(rop_arr, date_arr, rop_limit){
		var time_arr = [];
		rop_minute = 24*60/rop_limit;

		for(var i=0; i<rop_limit;i++){
			m=i*rop_minute
			min=m%60;
			hour=(m-min)/60;
			hour = (hour < 10 ? '0' : '') + hour;
			min = (min < 10 ? '0' : '') + min;
			time_arr.push(hour+":"+min+":"+"00");
		}

		//Prepare date_merged for each Point
		for(var i=0;i<date_arr.length;i++){
			if(typeof date_arr[i] == 'number'){
				rop=rop_arr[i]
				time=time_arr[rop]
				date_arr[i]=date_arr[i].toString().replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3');
				date_arr[i]=date_arr[i]+" "+time;
			}
		}
		return date_arr

	}

	


	function prepData_1d(stack){
		var rop_arr=[],
			kpi_arr=[],
			error_arr=[],
			date_arr=[];
		var d=stack;
		d.forEach(function(datum, i) {
	        rop_arr.push(datum["rop_arr"]);
	        kpi_arr.push(datum["kpi_arr"]); 
	        error_arr.push(datum["error_arr"]);
	        date_arr.push(datum["date_arr"]);
		});
		var data={}
		

		data['rop_arr'] = rop_arr;
		data['kpi_arr'] = kpi_arr;
		data['error_arr'] = error_arr;
		data['date_arr'] = date_arr;
		
		
		return data;
	}




	function plotly_rop (received_data) {

		key = received_data["key"];
		title = received_data['kpi_name'];
		rop_limit = received_data['rop_limit'];
		rec_limit = received_data['rec_limit'];
		data_prep=prepData_1d(received_data["data"]);
		rop_arr = data_prep["rop_arr"];
		kpi_arr = data_prep["kpi_arr"];
		error_arr = data_prep["error_arr"];
		date_arr = data_prep["date_arr"];

		colors_main=asignColors(error_arr);
		date_merged=assignDate(rop_arr, date_arr, received_data['rop_limit']);

		


		myPlot =document.getElementById('ploter');
		error_inf['error_arr'] = error_arr;
		error_inf['key'] = key;

		var slice_len = 20;
		var	slice_num=Math.ceil(rop_limit/slice_len);
		var slice_rop_len = rec_limit * slice_len;


		var d_arr=[],
			button_arr=[];
		for(var i=0;i<slice_num;i++){
			start = i*slice_rop_len;
			end = (i+1)*slice_rop_len;
			//propare DATA for 0-20, 0-40, 0-60, 0-80 slices
			
			d_arr[i] = {	
			    			x:rop_arr.slice(start,end), 
							y:kpi_arr.slice(start,end), 
							type:'scatter',
							mode:'markers',
							name: (i*slice_len)+" - "+((i+1)*slice_len), 
							visible: true,
							line:{ color:'#5C636E'},
							marker:{size:8, color : colors_main.slice(start,end)},
							textD : date_merged.slice(start,end)

			};
			//propare BUTTON for 0-20, 0-40, 0-60, 0-80 slices
			visible_arr = new Array(slice_num).fill(false);
			visible_arr[i] = true;
			button_arr[i]= {
				            method: 'update',
				            args: [{'visible': visible_arr}],
				            label: (i*slice_len)+" - "+((i+1)*slice_len)
			};
		}
		//prepare BUTTON for 0-100 slice
		visible_arr = new Array(slice_num).fill(true);
		button_arr[slice_num]={
				            method: 'update',
				            args: [{'visible': visible_arr}],
				            label: 0+" - "+(slice_num*slice_len)
		};
		var updatemenus = 	[{
							        
						        buttons: button_arr,
						       	direction: 'left',
						        pad: {'r': 5, 't': 5},
						        showactive: true,
						        type: 'buttons',
						        x: 0.00,
						        xanchor: 'left',
						        y: -0.2,
						        yanchor: 'bottom',
						        font: {color: '#5c72a8'},
						        active: button_arr.length-1,
						        bgcolor: '#aaaaaa',
						        bordercolor: '#FFFFFF'
						    }
		];
		
	    var	layout = {
				        showlegend : true,
				        hovermode :'closest',
				        title : title,
				        updatemenus: updatemenus,
				        scene:{
								bgcolor: 'black',
								aspectratio: {x: 2, y: 3},
								aspectmode: 'manual'
						}
		};


		Plotly.newPlot('ploter', d_arr, layout,{showSendToCloud: false,displaylogo: false});
		var hoverInfo = document.getElementsByClassName("gtitle")[0];
		var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',hour:'2-digit', minute:'2-digit'};
		myPlot.on('plotly_hover', function(d_arr){
		    	var infotext = d_arr.points.map(function(d){
		    						x=d.x;
		    						y=d.y;
		    						pointIndex=d.pointIndex
		    						date_c=new Date(d.data.textD[pointIndex]).toLocaleDateString("en-US", options);
		     						text= date_c+'\nKpi= '+y+' |  Rop_num= '+x;
		    						return text;
		    					});

		    hoverInfo.innerHTML=infotext.join('<br/>');
		})
		.on('plotly_unhover', function(){
		    hoverInfo.innerHTML=title;
		});
		

		var index=null;
		myPlot.on('plotly_click', function(data){
		  	var pn='',
		   	tn='',
		   	colors='';
			for(var i=0; i < data.points.length; i++){
				pn = data.points[i].pointNumber;
				tn = data.points[i].curveNumber;
				//colors = data.points[i].data.marker.color;	
			};
			
			index_num=(tn*slice_rop_len)+pn;
			start = tn*slice_rop_len;
			end = (tn+1)*slice_rop_len;
			// Change color related error number
			if(error_arr[index_num]==0){
				error_arr[index_num]=2
				colors_main[index_num]='cf00ff';
			}else if(error_arr[index_num]==1){
				error_arr[index_num]=3
				colors_main[index_num]='#ff0000';				
			}else if(error_arr[index_num]==2){
				error_arr[index_num]=0
				colors_main[index_num]='#5C636E';
			}else if(error_arr[index_num]==3){
				error_arr[index_num]=1
				colors_main[index_num]='#005dff';
			}
			else{
				colors_main[index_num]='#000000';
				error_arr[index_num]=-1
			}
			var update1 = {'marker':{color: colors_main.slice(start,end), size:8}};
			Plotly.restyle('ploter', update1,[tn]);			
		});

		myPlot.on('plotly_legendclick', function(data){
			var k=0;
			start = data.curveNumber*slice_rop_len;
			end= (data.curveNumber+1)*slice_rop_len;
			for(var i=start;i<end;i++){
					if(error_arr[i]==2){
						error_arr[i]=0
						colors_main[i]='#5C636E';
					}else if(error_arr[i]==3){
						error_arr[i]=1
						colors_main[i]='#005dff';
					}
					else if(error_arr[i]!=0 && error_arr[i]!=1){
						colors_main[i]='#000000';
						error_arr[i]=-1
					}	
			}
			var update = {'marker':{color: colors_main.slice(start,end), size:8}};
			Plotly.restyle('ploter', update,[data.curveNumber]);
		return false;	
		});


		function eventTriggeredHandler() {
		   alert("Browser is overloaded,  program  lose its WebGL context");
		}
		myPlot.on('plotly_webglcontextlost', eventTriggeredHandler);
	}













	function plotly_date (received_data) {

		key = received_data["key"];
		title = received_data['kpi_name'];
		rop_limit = received_data['rop_limit'];
		rec_limit = received_data['rec_limit'];
		data_prep=prepData_1d(received_data["data"]);
		rop_arr = data_prep["rop_arr"];
		kpi_arr = data_prep["kpi_arr"];
		error_arr = data_prep["error_arr"];
		date_arr = data_prep["date_arr"];
		colors_main=asignColors(error_arr);
		date_merged=assignDate(rop_arr, date_arr, received_data['rop_limit']);


		myPlot =document.getElementById('ploter');
		error_inf['error_arr'] = error_arr;
		error_inf['key'] = key;

		var slice_len = 7;
		var	slice_num=Math.ceil(rec_limit/slice_len);
		var slice_rop_len = rop_limit * slice_len;


		var d_arr=[],
			button_arr=[];
		for(var i=0;i<slice_num;i++){
			start = i*slice_rop_len;
			end = (i+1)*slice_rop_len;
			//propare DATA for 0-20, 0-40, 0-60, 0-80 slices
			d_arr[i] = {	
			    			x:date_merged.slice(start,end), 
							y:kpi_arr.slice(start,end), 
							type:'scatter',
							mode:'markers+lines',
							name: (i*slice_len)+" - "+((i+1)*slice_len), 
							visible: true,
							line:{ color:'#5C636E'},
							marker:{size:6, color : colors_main.slice(start,end)},
							text : rop_arr.slice(start,end)

			};
			
			//propare BUTTON for 0-20, 0-40, 0-60, 0-80 slices
			visible_arr = new Array(slice_num).fill(false);
			visible_arr[i] = true;
			button_arr[i]= {
				            method: 'update',
				            args: [{'visible': visible_arr}],
				            label: (i*slice_len)+" - "+((i+1)*slice_len)
			};
		}
		//prepare BUTTON for 0-100 slice
		visible_arr = new Array(slice_num).fill(true);
		button_arr[slice_num]={
				            method: 'update',
				            args: [{'visible': visible_arr}],
				            label: 0+" - "+(slice_num*slice_len)
		};
		var updatemenus = 	[{
							        
						        buttons: button_arr,
						       	direction: 'left',
						        pad: {'r': 5, 't': 5},
						        showactive: true,
						        type: 'buttons',
						        x: 0.00,
						        xanchor: 'left',
						        y: -0.4,
						        yanchor: 'top',
						        font: {color: '#5c72a8'},
						        active: button_arr.length-1,
						        bgcolor: '#aaaaaa',
						        bordercolor: '#FFFFFF'
						    }
		];
		var selectorOptions = {
		    buttons: [{
		        step: 'day',
		        stepmode: 'forward',
		        count: 1,
		        label: '1d'
		    }, {
		        step: 'day',
		        stepmode: 'forward',
		        count: 2,
		        label: '2d'
		    }, {
		        step: 'month',
		        stepmode: 'forward',
		        count: 5,
		        label: '5d'
		    }, {
		        step: 'all',
		    }],
		};
		var	layout = {
				        showlegend : true,
				        hovermode :'closest',
				        title : title,
				        updatemenus: updatemenus,
				        xaxis: {
				            rangeselector: selectorOptions,
				            rangeslider: {},
				            
				        },
				        yaxis: {
				            fixedrange: false
				        },
				        scene: 	
				        	{
								bgcolor: 'black',
								aspectratio: {x: 2, y: 3},
								aspectmode: 'manual'
							 }
		};
		


		Plotly.newPlot('ploter', d_arr, layout,{showSendToCloud: false,displaylogo: false});
		/*
		var hoverInfo = document.getElementById('hoverinfo');
		myPlot.on('plotly_hover', function(data){
		    	var infotext = data.points.map(function(d){
		     	return (d.data.name+': x= '+d.x+', y= '+d.y.toPrecision(3)+', text= '+ d.text);
		    });

		    hoverInfo.innerHTML = infotext.join('<br/>');
		})
		.on('plotly_unhover', function(data){
		    hoverInfo.innerHTML = '';
		});
		*/
		

		var index=null;
		myPlot.on('plotly_click', function(data){
		  	var pn='',
		   	tn='',
		   	colors='';
			for(var i=0; i < data.points.length; i++){
				pn = data.points[i].pointNumber;
				tn = data.points[i].curveNumber;
				//colors = data.points[i].data.marker.color;	
			};
			
			index_num=(tn*slice_rop_len)+pn;
			start = tn*slice_rop_len;
			end = (tn+1)*slice_rop_len;
			// Change color related error number
			if(error_arr[index_num]==0){
				error_arr[index_num]=2
				colors_main[index_num]='cf00ff';
			}else if(error_arr[index_num]==1){
				error_arr[index_num]=3
				colors_main[index_num]='#ff0000';				
			}else if(error_arr[index_num]==2){
				error_arr[index_num]=0
				colors_main[index_num]='#5C636E';
			}else if(error_arr[index_num]==3){
				error_arr[index_num]=1
				colors_main[index_num]='#005dff';
			}
			else{
				colors_main[index_num]='#000000';
				error_arr[index_num]=-1
			}
			var update1 = {'marker':{color: colors_main.slice(start,end), size:6}};
			Plotly.restyle('ploter', update1,[tn]);			
		});

		myPlot.on('plotly_legendclick', function(data){
			var k=0;
			start = data.curveNumber*slice_rop_len;
			end= (data.curveNumber+1)*slice_rop_len;
			for(var i=start;i<end;i++){
					if(error_arr[i]==2){
						error_arr[i]=0
						colors_main[i]='#5C636E';
					}else if(error_arr[i]==3){
						error_arr[i]=1
						colors_main[i]='#005dff';
					}
					else if(error_arr[i]!=0 && error_arr[i]!=1){
						colors_main[i]='#000000';
						error_arr[i]=-1
					}	
			}
			var update = {'marker':{color: colors_main.slice(start,end), size:6}};
			Plotly.restyle('ploter', update,[data.curveNumber]);
		return false;	
		});


		function eventTriggeredHandler() {
		   alert("Browser is overloaded,  program  lose its WebGL context");
		}
		myPlot.on('plotly_webglcontextlost', eventTriggeredHandler);
	}













	function prepData_2d(rows, key) {
		colm=rows.map(function(row) { return row[key]; });
		return colm
	}


	function assignDate_2d(rop_data, date_data, rop_limit, rec_limit){
		var time_arr = [];
		rop_minute = 24*60/rop_limit;

		for(var i=0; i<rop_limit;i++){
			m=i*rop_minute
			min=m%60;
			hour=(m-min)/60;
			hour = (hour < 10 ? '0' : '') + hour;
			min = (min < 10 ? '0' : '') + min;
			time_arr.push(hour+":"+min+":"+"00");
		}

		//Prepare date_merged for each Point
		for(var i=0;i<rec_limit;i++){
			for(var j=0;j<rop_limit;j++){
				if(typeof rop_data[i][j] == 'number' && typeof date_data[i][j] == 'number'){
					rop=rop_data[i][j]
					time=time_arr[rop]
					date_data[i][j]=date_data[i][j].toString().replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3');
					date_data[i][j]=date_data[i][j]+" "+time;
				}else{
					date_data[i][j]="";
				}
			}
		}
		return date_data
	}

	function plotly_3d (received_data) {

		key = received_data["key"];
		title = received_data['kpi_name'];
		rop_limit = received_data['rop_limit'];
		rec_limit = received_data['rec_limit'];


		myPlot =document.getElementById('ploter');



		var z_data=[ ],
			rop_data=[ ],
			date_data=[ ];
		for(i=0;i<rec_limit;i++){
			z_data.push(prepData_2d(received_data["kpi_arr"],i));
			rop_data.push(prepData_2d(received_data["rop_arr"],i));
			date_data.push(prepData_2d(received_data["date_arr"],i));
		}
		date_merged=assignDate_2d(rop_data, date_data, rop_limit, rec_limit);

		var data = [{
			z: z_data,
			text : date_merged,
			type: 'surface'
		}];
		var layout = {
			title: title,
			hovermode: false,
			autosize: true,
			margin: {
				l: 65,
				r: 50,
				b: 65,
				t: 90,
			}
		};
		Plotly.newPlot('ploter', data, layout, {showSendToCloud: false,displaylogo: false});
		// var hoverInfo = $(".gtitle");
		var hoverInfo = document.getElementsByClassName("gtitle")[0];
		var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',hour:'2-digit', minute:'2-digit'};
		myPlot.on('plotly_hover', function(data){
		    	var infotext = data.points.map(function(d){
		    						x=d.x;
		    						y=d.y;
		    						date_c=new Date(d.data.text[y][x]).toLocaleDateString("en-US", options);
		     						text= date_c+'\nKpi= '+d.z+' |  Rop_num= '+x+' |  Day_num='+y;
		    						return text;
		    					});

		    hoverInfo.innerHTML=infotext.join('<br/>');
		})
		.on('plotly_unhover', function(data){
		    hoverInfo.innerHTML=title;
		});
	}
