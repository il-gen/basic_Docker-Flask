// // Stop the form from submitting since we’re handling that with AJAX.
// event.preventDefault();
// // send selected options to server.
// const data = formToJSON(event.target);
// Select input element which has  device_name  using id and class 
// const selec_rnc=$("select[id='device_name']" , ".contact-form");
//main.options[i-1].selected = true;
//  $(document).ready(function() {
//  });
// Demo only: print the form data onscreen as a formatted JSON object.
// Use `JSON.stringify()` to make the output valid, human-readable JSON.
//$(".results__display").text(JSON.stringify(data, null, "  ")); 

( function ( $ ) {
  // "use strict";

    /**
     * A handler function to prevent default submission and run our custom script.
     * @param  {Event} event  the submit event triggered by the user
     * @return {void}
     */

    const changeDeviceName = (obj) => {
      
      
      device_name = $(obj);
      // Select parent card element of selecteddevice 
      var card_data = device_name.parentsUntil(".card").last().parent();
      
      // Convert input element of device_name   to JSON data
      var s_data = formToJSON(device_name);
      var token = $("input#CSRF_token").val();
      $.ajax({
          url: "/form_creator",
          data : JSON.stringify(s_data),
          method : 'POST',
          contentType: 'application/json;charset=UTF-8',
          headers: {
                      'X-CSRF-Token': token 
                  },
          success: function (r_data) {
                      r_data=JSON.parse(r_data);
                      // Remove all option include select device or select kpi or select profile options
                      card_data.find('.form-option').each(function(){
                                                            this.remove();
                                                          });
                      // Add profile selection options
                      var profile_name=card_data.find('#profile_name');
                      if(typeof profile_name !== 'undefined'){
                        var profile_arr=r_data["profile_index"].split(",");

                        for (var i = 0, len = profile_arr.length; i < len; ++i) {
                          profile_name.append('<option class="form-option" value="'+profile_arr[i]+'">'+profile_arr[i]+'</option>');
                        }
                        // Remove select protection
                        profile_name.removeAttr( "disabled");
                      }

                      // Add kpi selection options
                      var kpi_name=card_data.find('#kpi_name');
                      if(typeof kpi_name !== 'undefined'){
                        var kpi_arr = r_data["kpi_headers"].split(",");
                        for (var i = 6, len = kpi_arr.length; i < len; ++i) {
                          kpi_name.append('<option class="form-option" value="'+kpi_arr[i]+'">'+kpi_arr[i]+'</option>');
                        }
                        // Remove select protection
                        kpi_name.removeAttr( "disabled" );
                      }
                      //make Multiple select make-up
                      makeMultipleSelect(card_data); 
                  },
          error: function (r_data) {
                      console.log("changeDeviceName ERROR",r_data)
                  }
      });

      



      

    }


    const getDeviceInf = (obj) => {
      
      var form = obj.parentsUntil(".contact-form").last().parent();
      var s_data = formToJSON(form[0].elements);
      var token = $("input#CSRF_token").val();
      $.ajax({
          url: "/plot_process",
          data : JSON.stringify(s_data),
          method : 'POST',
          contentType: 'application/json;charset=UTF-8',
          headers: {
                      'X-CSRF-Token': token 
                  },
          success: function (r_data) {
                      // Reflesh date title of -Plot Card-
                      $("#kpi_card_title").text(r_data["device_name"], null, "  ");
                      $("#kpi_card_date").text(r_data["date_start"]+" - "+r_data["date_end"], null, "  ");
                      // Run Plot Function
                      if(r_data["plot_type"]=="rop"){
                        plotly_rop(r_data);
                      }else if(r_data["plot_type"]=="date"){
                        plotly_date(r_data);
                      }else if(r_data["plot_type"]=="3d"){
                        plotly_3d(r_data);
                      }else{
                        console.log("plot_type not defined");
                      }
          },
          error: function (r_data) {
                      console.log("getDeviceInf ERROR",r_data)
          }
      });
      
    };



    const sendErrorInf = () => {
      var token = $("input#CSRF_token").val();
      $.ajax({
          url: "/error_process",
          data : JSON.stringify(error_inf),
          method : 'POST',
          contentType: 'application/json;charset=UTF-8',
          headers: {
                      'X-CSRF-Token': token 
                  },
          success: function (r_data) {
                  console.log(JSON.stringify(r_data));
                      
          },
          error: function (r_data) {
                      console.log("sendErrorInf ERROR",r_data)
          }
      });
    }




    

    const getTable = (table_body) => {
      var s_data={};
      s_data["data"]={};
      var i=0;
      //Collect data from multiple form data. And store in  s_data["data"]

      var form = $(".contact-form").each(function() {
                                            s_data["data"][i++] = formToJSON(this.elements);
                                          });
      // Send Device list for running and receive table info according to its type (datatable? assoctable? runtable?)
      var token = $("input#CSRF_token").val();
      $.ajax({
          url: "/table_creator",
          data : JSON.stringify(s_data),
          method : 'POST',
          contentType: 'application/json;charset=UTF-8',
          headers: {
                      'X-CSRF-Token': token 
                  },
          success: function (r_data) {
                      var dataSet = r_data['data'];

                      //Create Column header object  for Jequery Data-table
                      var dataclmns = r_data['columns'].reduce((x,y)=>(x.concat([{title : y}])),[]);
                      //Remove  html Jequery Data-table and its data if there is
                      table_body.children().remove();
                      //Create empty html table for   Jequery Data-table
                      table_body.append(' <table id="bootstrap-data-table-export" class="table table-striped table-bordered"></table>');
                      
                      /* Custom filtering function which will search data in column four between two values */

                      $.fn.dataTable.ext.search.push(
                          function( settings, data, dataIndex ) {
                              var min = parseInt( $('#min').val(), 10 );
                              var max = parseInt( $('#max').val(), 10 );
                              var date = parseFloat( data[2] ) || 0; // use data for the date column
                              // console.log(min,"-",max,"-",date);
                              if ( ( isNaN( min ) && isNaN( max ) ) ||
                                   ( isNaN( min ) && date <= max ) ||
                                   ( min <= date   && isNaN( max ) ) ||
                                   ( min <= date   && date <= max ) )
                              {
                                  return true;
                              }
                              return false;
                          }
                      );

                      //Fill Jequery Data-table
                      var table = $('#bootstrap-data-table-export').DataTable( {
                          data: dataSet,
                          "pageLength": 25,
                          columns: dataclmns,
                          "scrollX": true,
                          destroy: true,
                          dom: 'frtipB',
                          buttons: [
                              'copy', 'csv', 'excel', 'pdf', 'print'
                          ]
                      });

                      // Event listener to the two range filtering inputs to redraw on input
                      $("#filter").click( function() {
                                            table.draw();
                      });                      
          },
          error: function (r_data) {
                      console.log("getTable ERROR",r_data)
          }
      });

    }

    const addControlBoard = (obj,card_obj_main) => {
      var card_obj = $(obj).parentsUntil("div[name='card_board']").last().parent();
      // var card_obj_cln = card_obj.clone();
      var card_obj_cln2=card_obj_main.clone();
      //make Multiple select make-up
      makeMultipleSelect(card_obj_cln2);
      card_obj.after(card_obj_cln2);

      var next=card_obj.next();

      var add_cb_button=next.find("button[id='add_cb_button']");
      if(typeof add_cb_button[0] !== 'undefined'){
        add_cb_button[0].addEventListener("click", function(){
                                            addControlBoard(this,card_obj_main);
                                          });
      }
      var eq_cb_button=next.find("button[id='eq_cb_button']");
      if(typeof eq_cb_button[0] !== 'undefined'){
        eq_cb_button[0].addEventListener("click", function(){
                                            makeEqual(this,card_obj_main);
                                          });
      }
     
      var option=next.find("select[name='device_name']");
      if(typeof option[0] !== 'undefined'){
        option[0].addEventListener("change", function(){
                                            changeDeviceName(this);
                                          });
      }
    }


    const makeEqual = (obj,card_obj_main) => {
      var card_obj = $(obj).parent().parent().parent().parent().parent();
      var card_obj_index=card_obj.index();
      var card_obj_all=card_obj.parent().children();
      var option_len=card_obj_main.find("select[name='device_name']")[0].length;
      card_obj_all.each(function(){
                          // console.log($(this).find("select[name='device_name']")[0]);
                          if (card_obj_index != $(this).index()){
                            var profile_name_sel = $(this).find("select[name='profile_name']");
                            var profile_name_sel_cld = profile_name_sel.children();
                            var profile_name_main_cld = $(card_obj).find("select[name='profile_name']").children();
                            profile_name_sel_cld.each(function(){
                                                                  var children_num = $(this).index();
                                                                  this.selected=profile_name_main_cld[children_num].selected
                                                                });
                            var kpi_name_sel = $(this).find("select[name='kpi_name']");
                            var kpi_name_sel_cld = kpi_name_sel.children();
                            var kpi_name_main_cld = $(card_obj).find("select[name='kpi_name']").children();
                            kpi_name_sel_cld.each(function(){
                                                              var children_num = $(this).index();
                                                              this.selected=kpi_name_main_cld[children_num].selected
                                                            });
                          }
                        
                        var p=$(this).find("select[name='profile_name']");
                        $(profile_name_sel).multiselect("destroy");
                        $(kpi_name_sel).multiselect("destroy");
                        // Second re-create  multiselect
                        $(profile_name_sel).multiselect({
                          enableClickableOptGroups: true,
                          enableCollapsibleOptGroups: true,
                          enableFiltering: true,
                          includeSelectAllOption: true,
                          maxHeight: 400,
                          buttonWidth: '83%',
                          dropDown: true
                        });
                        $(kpi_name_sel).multiselect({
                          enableClickableOptGroups: true,
                          enableCollapsibleOptGroups: true,
                          enableFiltering: true,
                          includeSelectAllOption: true,
                          maxHeight: 400,
                          buttonWidth: '83%',
                          dropDown: true
                        });
                        

                        });
    }
    const sendRunInf = () => {
      var form = $(".contact-form")[0];
      var s_data = formToJSON(form.elements);
      // Rearrange run type of swich
      if(typeof s_data["analyse"] == 'undefined'){
        s_data["analyse"]="off";
      }else{
        s_data["analyse"]="on";
      }
      if(typeof s_data["assoc"] == 'undefined'){
        s_data["assoc"]="off";
      }else{
        s_data["assoc"]="on";
      }
      if(typeof s_data["ml"] == 'undefined'){
        s_data["ml"]="off";
      }else{
        s_data["ml"]="on";
      }
      var token = $("input#CSRF_token").val();
      $.ajax({
          url: "/run_process",
          data : JSON.stringify(s_data),
          method : 'POST',
          contentType: 'application/json;charset=UTF-8',
          headers: {
                      'X-CSRF-Token': token 
                  },
          success: function (r_data) {
                      if(r_data["result"]==true){
                        console.log(r_data)
                        $("#alert").append('<div class="col-sm-12"><div class="alert  alert-success alert-dismissible fade show" role="alert"><span class="badge badge-pill badge-success">Success</span> '+r_data["log"]+'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div></div>');
                          var table_body= $("#table_body");
                          var w=table_body.width();
                          table_body.css("width",w);
                          getTable(table_body);   
                          }                   
          },
          error: function (r_data) {
                    console.log("run ERROR",r_data)
          }
      });

    }
    const makeMultipleSelect = (card_obj) => {
       // Check select elemet has multiple attribute
      //if it has multiselect then define multiselect option for new selection element data
       // Check select elemet has multiple attribute
      var selection = card_obj.find(".standardSelect");
        //if it has multiselect then define multiselect option for new selection element data
      for(var i=0,len=selection.length;i<len;i++){
        var attr=$(selection[i]).attr('multiple');
        if(typeof attr !== typeof undefined && attr !== false){
          // First destroy if tehee is defined multiselect
          $(selection[i]).multiselect("destroy");
          // Second re-create  multiselect
          $(selection[i]).multiselect({
            enableClickableOptGroups: true,
            enableCollapsibleOptGroups: true,
            enableFiltering: true,
            includeSelectAllOption: true,
            maxHeight: 400,
            buttonWidth: '83%',
            dropDown: true
          });
        }
      }
    }

    //RUN_MODULE 
    const send_run_inf = $('#send_run_inf');
    if(typeof send_run_inf[0] !== 'undefined'){
      send_run_inf[0].addEventListener('click', sendRunInf);
    }



    //AI_PLOT  &  3D_PLOT
    const get_inf = $('#get_inf');
    if(typeof get_inf[0] !== 'undefined'){
      get_inf[0].addEventListener('click', function(){
                                            getDeviceInf(get_inf);
                                        });
    }

    //DATA_TABLE  && ASSOCIATION_MODULE && RUN_MODULE
    const get_table = $('#get_tab')[0];
    if(typeof get_table !== 'undefined'){
      var table_body= $("#table_body");
      var w=table_body.width();
      table_body.css("width",w);
      get_table.addEventListener('click', function(){
                                            getTable(table_body);
                                        });
    }

    //DATA_TABLE
    const eq_cb_button = $("button[id='eq_cb_button']");
    if(typeof eq_cb_button[0] !== 'undefined'){
      const card_obj_main = eq_cb_button.parentsUntil("div[name='card_board']").last().parent().clone();
      eq_cb_button[0].addEventListener('click', function(){
                                                  makeEqual(this,card_obj_main);
                                                });
    }

    //DATA_TABLE
    const add_cb_button = $("button[id='add_cb_button']");
    if(typeof add_cb_button[0] !== 'undefined'){
      const card_obj_main = add_cb_button.parentsUntil("div[name='card_board']").last().parent().clone();
      add_cb_button[0].addEventListener('click', function(){
                                                addControlBoard(this,card_obj_main);
                                              });
    }


    //AI_PLOT  &&  3D_PLOT && DATA_TABLE && ASSOCIATION_MODULE && RUN_MODULE
    const option = $('#device_name');
    if(typeof option[0] !== 'undefined'){
      var card_data = option.parentsUntil(".card").last().parent();
      //make Multiple select make-up
      makeMultipleSelect(card_data);
      option[0].addEventListener("change", function(){
                                          changeDeviceName(this);
                                        });
    }



    
    //AI_PLOT
    const send_butt = $('#send_err')[0];
    if(typeof send_butt !== 'undefined'){
      send_butt.addEventListener("click", sendErrorInf);
    }


   







    // $('[data-toggle="popover"]').popover({
    //   placement: "right",
    //   trigger : "manual",
    //   title:"Başlık",
    //   template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body">Bu bir deneme0</div></div>',
    //   content :"Bu bir deneme1"
    // });
    // $('#asd1').popover('show');
    // $('#asd1').on("click", function() {$('#asd2').popover('show');
    //                                    $('#asd1').popover('hide')});

    // $('#asd2').on("click", function() {$('#asd3').popover('show');
    //                                    $('#asd2').popover('hide')});

    // $('#asd3').on("click", function() {$('#asd1').popover('show');
    //                                    $('#asd3').popover('hide')});


// $(document).ready(function(){
//     //connect to the socket server.
//     var socket = io.connect('http://' + document.domain + ':' + location.port + '/csl');
//     var numbers_received = [];
    
//     $('#show_result').on('click', function(event) {
//       socket.emit('runrun', {run: 1});
//       return false;
//     });


//     //receive details from server
//     socket.on('new_console', function(msg,cb) {
//         console.log("Received number" + msg.number);
//         //maintain a list of ten numbers
//         if (numbers_received.length >= 10){
//             numbers_received.shift()
//         }            
//         numbers_received.push(msg.number);
//         var numbers_string = '';
//         for (var i = 0; i < numbers_received.length; i++){
//             numbers_string = numbers_string + '<p>' + numbers_received[i].toString() + '</p>';
//         }
//         $('#log').html(numbers_string);
//     });

// });

} )( jQuery );

