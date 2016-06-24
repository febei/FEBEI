(function(window, undefined) {
  window.tracking = window.tracking || {};

  tracking.listToMatrix = function(list, elementsPerSubArray) {
    var matrix = [], i, k;

    for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }

        matrix[k].push(list[i]);
    }

    return matrix;
  };

  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };

  tracking.detect = function(attribute, element, context, canvas, tracker, opt_options) {
    if(attribute == "EigenEmotions") {
  		svm = new svmjs.SVM();
      svm.fromJSON(svm_model);
  		console.log(svm);

      tracking.track(element, tracker, opt_options);

      tracker.on('track', function(event) {
        // context.clearRect(0, 0, canvas.width, canvas.height);

        event.data.forEach(function(rect) {
          elemone = $(element);
          context.drawImage(elemone[0], 0, 0, canvas.width, canvas.height);
          var templateImageData = context.getImageData(rect.x, rect.y, rect.width, rect.height);

          var height_ratio = 50/rect.height;
          var width_ratio = 37/rect.width;
          var newCanvas = $("<canvas>")
              .attr("width", templateImageData.width)
              .attr("height", templateImageData.height)[0];

          newCanvas.getContext("2d").putImageData(templateImageData, 0, 0);

          newCanvas.getContext("2d").scale(width_ratio, height_ratio);
          newCanvas.getContext("2d").drawImage(newCanvas, 0, 0);
          templateImageData = newCanvas.getContext("2d").getImageData(0, 0, rect.width*width_ratio, rect.height*height_ratio);
          var box_data = templateImageData.data;
          var box_data_new = [];
          var count = 0;

          for (var i = 0; i < box_data.length; i += 4) {
            if(count <= 1849) {
              var avg = (box_data[i] + box_data[i+1] + box_data[i+2]) / 3;
              box_data_new[count] = avg;
              count++;
            }
          }


          templateImageData.data = box_data_new;

          var c = document.getElementById("myCanvas");
          var ctx = c.getContext("2d");
          ctx.putImageData(templateImageData, 0, 0);
          ctx.drawImage(c, 0, 0);

          var max_val = box_data_new.max();

          for(var i=0;i<=count;i++) {
              if(count <= 1849) {
                box_data_new[i] = (box_data_new[i]/max_val) - mean[i];
              }
          }

          var sigma = numeric.dot(box_data_new, components);

          var a = svm.predict([sigma]);

          $.post('http://localhost:5000/face/', {box_data_new}).done(function(data) {
            console.log(data);
            if(data == 1){
              $('.python_pred').html("The Python prediction is <span class='angry'></span>");
            } else {
              $('.python_pred').html("The Python prediction is <span class='happy'></span>");
            }

            if(a == -1){
              $('.js_pred').html("The JS prediction is <span class='happy'></span>");
            } else {
              $('.js_pred').html("The JS prediction is <span class='angry'></span>");
            }
          });

          context.putImageData(templateImageData, 403, 0);

        });
      });
    }
  };
}(window));