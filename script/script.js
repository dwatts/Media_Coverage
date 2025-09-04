/***Send images to modal and launch***/

$('.app-image').click(function (e) {
  let location = $(e.target).attr('src')
  let caption = $(e.target).attr('data-caption')
  $('#neatModalImg').attr('src', location);
  $('#img-modal').fadeIn(500);
  $('#img-caption').html(caption);
});

/***Fade in Splash Screen on Load***/

$(document).ready(function(){
    $('.splash-container').fadeIn(700);
});

/***Close Splash Screen***/

$('.splash-btn').click(function () {
    $('.splash-container').fadeOut(700);
})

/***Trigger About Modal***/

$('.nav-item:nth-of-type(5)').click(function () {
  $('#about-modal').fadeIn(500);
})

/***Close all modals***/

$('#about-close, #img-close, #transcript-close').click(function () {
    $('#img-modal').fadeOut(500);
    $('#about-modal').fadeOut(500);
    $('#transcript-modal').fadeOut(500);
})

/***Open / Close side panel***/

$('#panel-btn').click(function(){
  $('.side-panel').toggleClass('on');
  $('#panel-btn').toggleClass('on');
});

$('#panel-close').click(function(){
  $('.side-panel').addClass('on');
  $('#panel-btn').toggleClass('on');
});

/***Open / Close about panel***/

$('#help-btn').click(function(){
  $('.help-panel').toggleClass('on');
  $('#help-btn').toggleClass('on');
});

$('#help-close').click(function(){
  $('.help-panel').toggleClass('on');
  $('#help-btn').toggleClass('on');
});

/***Start ArcGIS JS***/

require(["esri/views/SceneView", "esri/WebScene", "esri/layers/FeatureLayer", "esri/layers/TileLayer", "esri/layers/VectorTileLayer", "esri/Basemap"], (SceneView, WebScene, FeatureLayer, TileLayer, VectorTileLayer, Basemap) => {

    /***Add Layers***/

    const cities = new FeatureLayer({
      url: "https://services2.arcgis.com/njxlOVQKvDzk10uN/arcgis/rest/services/Media_Coverage/FeatureServer/0",
      id: 'cities',
      renderer: mediaRenderer,
      outFields: ["*"],
      popupEnabled: false,
      labelingInfo: [
        {
          labelExpressionInfo: {
            value: "{City}, {State}"
          },
          maxScale: 0,
          minScale: 5000000,
          symbol: {
            type: "label-3d",
            symbolLayers: {
              type: "text",
              material: { color: [64, 46, 50] },
              size: 11,
              font: {
                family: "Bodoni Moda",
                weight: "bold"
              },
              halo: {
                color: [255, 255, 255, 0.7], 
                size: 2
              }
            }
          }
        }
      ]
    });

    /***Basemap Layers***/

    const vectorTileLayer = new VectorTileLayer({
        portalItem: {
          id: "86a5d38d9933473cb9c7645f61068295", // Custom CRMP Basemap
        },
        opacity: 0.75,
      });

    const hillshadeTileLayer = new TileLayer({
      portalItem: {
        id: "1b243539f4514b6ba35e7d995890db1d", // World Hillshade
      },
    });

    const customBasemap = new Basemap({ baseLayers: [hillshadeTileLayer, vectorTileLayer] });

    /***Create Map and SceneView***/

    const map = new WebScene({
        basemap: customBasemap,
        // basemap: "topo-3d",
        ground: "world-elevation",
        layers: [cities],
    });

    map.ground.opacity = 1;

    const view = new SceneView({
        container: "viewDiv",
        map: map,
        qualityProfile: "high",
        highlights: [
          {name: "custom", color: "#649b92", haloColor: "#649b92", haloOpacity: 0.9, fillOpacity: 0.5, shadowOpacity: 0.2}
        ],
        environment: {
          background:{
              type: "color", 
              color: [244, 245, 240, 1]
          },
          atmosphereEnabled: false,
          starsEnabled: false
        },
        constraints: {
          altitude: {
            min: 500000,
            max: 8000000
          }
        },
        camera: {
          position: {
            // spatialReference: {
            //   latestWkid: 3857,
            //   wkid: 2857
            // },
            x: -97.3497654896104,
            y: 38.938391919294915,
            z: 7783963.6349063385
          },
          heading: 359.627264859108,
          tilt: 0.22518567955045343
        },
        ui: {
            components: []
        },
        viewingMode: "global"
    });

    /***Start Popup HitTest Functionality***/

    //Selectors

    let imgUrl = document.getElementById('popup-image-id');
    let audioUrl = document.getElementById('audio');
    let newspaper = document.querySelector('.newspaper')
    let place = document.querySelector('.place');
    let date = document.querySelector('.date');
    let article = document.querySelector('.article');
    let details = document.querySelector('.details');

    //Populating transcript modal
    let transcriptTitle = document.querySelector('.modal-transcript-title')
    let transcript = document.querySelector('.modal-transcript-text');

    //Counting JSON Records
    let recordCount = document.getElementById('counterText');
    let totalCount = document.getElementById('totalText');

    let recordCounter = 0;
    let currentRecordIndex = 0;

    //Reset audio player timer & progress bar

    function resetAudio () {
        audio.pause();
        audio.currentTime = 0;
        progress.style.width = '0%';
        timer.textContent = `00:00 / ${formatTime(audio.duration)}`;
        playPauseBtn.textContent = 'Play';
    };

    //Create empty array for related records

    let arr = [];

    let highlight;

    view.on("immediate-click", (event) => {
      view.hitTest(event).then((hitResult) => {
        if (hitResult.results.length > 0 && hitResult.results[0].graphic.layer.id == "cities") {
            
          /***Make popup div visible***/
        
          $('#cardId').fadeIn();
          $('#cardId').css('display','flex');

          /***Access all data attributes via hitTest***/

          let attributes = hitResult.results[0].graphic.attributes;

          /***Set Popup Modal Image Caption***/
          $('#popup-image-id').attr('data-caption', attributes.Caption);

          const mediaType = attributes.MediaType;

          const joinId = attributes.ID_INT;
          const jsonPath = "./assets/json/mediadetails.json";

          fetch(jsonPath)
            .then((response) => response.json())
            .then((data) => {
                // Filter related records by featureId
                const related = data.filter(
                    (record) => record.ID === joinId
                );

                // Clear array if already populated
                while (arr.length > 0) {
                    arr.pop();
                }
                // Loop through each related record and push to array
                related.forEach((item) => arr.push(item));

                // Set initial image and details info to first record

                let length = arr.length;

                newspaper.innerHTML = arr[0].Newspaper;
                imgUrl.src = arr[0].Url;
                audioUrl.src = arr[0].AudioURL;
                article.innerHTML = arr[0].Title;
                details.innerHTML = arr[0].Topic;
                place.innerHTML = `${arr[0].City}, ${arr[0].State}`;
                date.innerHTML = `\u00A0/ ${arr[0].Date}`;
                transcript.innerHTML = arr[0].Transcript;
                transcriptTitle.innerHTML = arr[0].Title;

                recordCount.innerHTML = "1";
                totalCount.innerHTML = `${length}`;

                // Look at array length and determine if pagination controls should be shown

                if (arr.length == 1) {
                  document.getElementById('pagination-container').style.display = "none";
                } else if (arr.length > 1) {
                  document.getElementById('pagination-container').style.display = "flex";
                } else {}

                if (mediaType === 'Radio') {
                  document.querySelector('.audio-player').style.display = "flex";
                  document.querySelector('.transcript-btn').style.display = "none";
                } else {
                  document.querySelector('.audio-player').style.display = "none";
                  document.querySelector('.transcript-btn').style.display = "block";
                }

              
            })
            .catch((err) => {
              console.error("Error loading related records:", err);
            });

            /***Highlight points functionality***/

            let result = hitResult.results[0].graphic;

            view.whenLayerView(result.layer).then((layerView) => {
                highlight?.remove();
                highlight = layerView.highlight(result, { name: "custom"});
            });

        } else {
            $('#cardId').fadeOut();
            highlight?.remove();
            resetAudio();
        }
      })
    })

    /***End Popup HitTest Functionality***/

    /***Pagination Controls***/

    function show_image(direction) {

      if (direction == 'left') {
          currentRecordIndex--;
      } else {
          currentRecordIndex++;
          currentRecordIndex %= arr.length;
      } if (currentRecordIndex < 0) {
          currentRecordIndex = arr.length - 1;
      }

      newspaper.innerText = arr[currentRecordIndex].Newspaper;
      imgUrl.src = arr[currentRecordIndex].Url;
      audioUrl.src = arr[currentRecordIndex].AudioURL;
      article.innerHTML = arr[currentRecordIndex].Title;
      details.innerHTML = arr[currentRecordIndex].Topic;
      place.innerHTML = `${arr[currentRecordIndex].City}, ${arr[currentRecordIndex].State}`;
      date.innerHTML = arr[currentRecordIndex].Date;
      transcript.innerHTML = arr[currentRecordIndex].Transcript;
      transcriptTitle.innerHTML = arr[currentRecordIndex].Title;

      recordCounter = currentRecordIndex + 1;
      $('#counterText').text(recordCounter);
    }

    $(document).on("click", '#left', function () {
      setTimeout(function(){
        show_image('left')
      }, 300);
      resetAudio();  
    })

    $(document).on("click", '#right', function () {
      setTimeout(function(){
        show_image('right')
      }, 300);
      resetAudio();
    })

    /***End Pagination Controls***/

    /***Trigger Transcript Modal with Popup***/

    $('.transcript-btn').click(function () {
      $('#transcript-modal').fadeIn(500);
    })

    /***Audio Player Controls***/

    const audio = document.getElementById('audio');
    const playPauseBtn = document.getElementById('play-pause');
    const progress = document.getElementById('progress');
    const progressContainer = document.getElementById('progress-container');
    const timer = document.getElementById('timer');

    // Toggle play/pause
    playPauseBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = 'Pause';
      } else {
        audio.pause();
        playPauseBtn.textContent = 'Play';
      }
    });

    // Update total duration when metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
      timer.textContent = `00:00 / ${formatTime(audio.duration)}`;
    });

    // Update progress bar and timer
    audio.addEventListener('timeupdate', () => {
      const { currentTime, duration } = audio;
      const percent = (currentTime / duration) * 100;
      progress.style.width = `${percent}%`;

      timer.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    });

    // Seek audio when progress bar is clicked
    progressContainer.addEventListener('click', (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = audio.duration;

      audio.currentTime = (clickX / width) * duration;
    });

    // Format seconds to mm:ss
    function formatTime(time) {
      if (isNaN(time)) return '00:00';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${pad(minutes)}:${pad(seconds)}`;
    }

    function pad(n) {
      return n < 10 ? '0' + n : n;
    }

    /***End Audio Player Controls***/

});