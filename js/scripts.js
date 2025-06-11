(function() {

  // Class to generate a random masonry layout, using a square grid as base
  class Grid {

    // The constructor receives all the following parameters:
    // - gridSize: The size (width and height) for smallest unit size
    // - gridColumns: Number of columns for the grid (width = gridColumns * gridSize)
    // - gridRows: Number of rows for the grid (height = gridRows * gridSize)
    // - gridMin: Min width and height limits for rectangles (in grid units)
    constructor(gridSize, gridColumns, gridRows, gridMin) {
      this.gridSize = gridSize
      this.gridColumns = gridColumns
      this.gridRows = gridRows
      this.gridMin = gridMin
      this.rects = []
      this.currentRects = [{ x: 0, y: 0, w: this.gridColumns, h: this.gridRows }]
    }

    // Takes the first rectangle on the list, and divides it in 2 more rectangles if possible
    splitCurrentRect () {
      if (this.currentRects.length) {
        const currentRect = this.currentRects.shift()
        const cutVertical = currentRect.w > currentRect.h
        const cutSide = cutVertical ? currentRect.w : currentRect.h
        const cutSize = cutVertical ? 'w' : 'h'
        const cutAxis = cutVertical ? 'x' : 'y'
        if (cutSide > this.gridMin * 2) {
          const rect1Size = randomInRange(this.gridMin, cutSide - this.gridMin)
          const rect1 = Object.assign({}, currentRect, { [cutSize]: rect1Size })
          const rect2 = Object.assign({}, currentRect, { [cutAxis]: currentRect[cutAxis] + rect1Size, [cutSize]: currentRect[cutSize] - rect1Size })
          this.currentRects.push(rect1, rect2)
        }
        else {
          this.rects.push(currentRect)
          this.splitCurrentRect()
        }
      }
    }

    // Call `splitCurrentRect` until there is no more rectangles on the list
    // Then return the list of rectangles
    generateRects () {
      while (this.currentRects.length) {
        this.splitCurrentRect()
      }
      return this.rects
    }
  }

  // Generate a random integer in the range provided
  function randomInRange (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Get canvas view
  const view = document.querySelector('.view')
  // Loaded resources will be here
  const resources = PIXI.Loader.shared.resources
  // Target for pointer. If down, value is 1, else value is 0
  let pointerDownTarget = 0
  // Useful variables to keep track of the pointer
  let pointerStart = new PIXI.Point()
  let pointerDiffStart = new PIXI.Point()
  let width, height
  let container, background
  let uniforms
  let app
  let diffX, diffY

  // Variables and settings for grid
  const gridSize = 50
  const gridMin = 3
  const imagePadding = 20
  let gridColumnsCount, gridRowsCount, gridColumns, gridRows, grid
  let widthRest, heightRest, centerX, centerY
  let rects, images, imagesUrls

  // Set dimensions
  function initDimensions () {
    width = window.innerWidth
    height = window.innerHeight
    diffX = 0
    diffY = 0
  }

  // Set initial values for uniforms
  function initUniforms () {
    uniforms = {
      uResolution: new PIXI.Point(width, height),
      uPointerDiff: new PIXI.Point(),
      uPointerDown: pointerDownTarget
    }
  }

  // Initialize the random grid layout
  function initGrid () {
    // Getting columns
    gridColumnsCount = Math.ceil(width / gridSize)
    // Getting rows
    gridRowsCount = Math.ceil(height / gridSize)
    // Make the grid 5 times bigger than viewport
    gridColumns = gridColumnsCount * 3
    gridRows = gridRowsCount * 3
    // Create a new Grid instance with our settings
    grid = new Grid(gridSize, gridColumns, gridRows, gridMin)
    // Calculate the center position for the grid in the viewport
    widthRest = Math.ceil(gridColumnsCount * gridSize - width)
    heightRest = Math.ceil(gridRowsCount * gridSize - height)
    centerX = (gridColumns * gridSize / 2) - (gridColumnsCount * gridSize / 2)
    centerY = (gridRows * gridSize / 2) - (gridRowsCount * gridSize / 2)
    // Generate the list of rects
    rects = grid.generateRects()
    // For the list of images
    images = []
    // For storing the image URL and avoid duplicates
    imagesUrls = {}
  }

  // Init the PixiJS Application
  function initApp () {
    // Create a PixiJS Application, using the view (canvas) provided
    app = new PIXI.Application({ view })
    // Resizes renderer view in CSS pixels to allow for resolutions other than 1
    app.renderer.autoDensity = true
    // Resize the view to match viewport size
    app.renderer.resize(width, height)

    // Set the distortion filter for the entire stage
    const stageFragmentShader = resources['shaders/stageFragment.glsl'].data
    const stageFilter = new PIXI.Filter(undefined, stageFragmentShader, uniforms)
    app.stage.filters = [stageFilter]
  }

  // Init the gridded background
  function initBackground () {
    // Create a new empty Sprite and define its size
    background = new PIXI.Sprite()
    background.width = width
    background.height = height
    // Get the code for the fragment shader from the loaded resources
    const backgroundFragmentShader = resources['shaders/backgroundFragment.glsl'].data
    // Create a new Filter using the fragment shader and the uniforms
    // We don't need a custom vertex shader, so we set it as `undefined`
    const backgroundFilter = new PIXI.Filter(undefined, backgroundFragmentShader, uniforms)
    // Assign the filter to the background Sprite
    background.filters = [backgroundFilter]
    // Add the background to the stage
    app.stage.addChild(background)
  }

  // Initialize a Container element for solid rectangles and images
  function initContainer () {
    container = new PIXI.Container()
    app.stage.addChild(container)
  }

  // Load texture for an image, giving its index
  function loadTextureForImage (index) {

    console.log("index: "+ index)
    // Get image Sprite
    const image = images[index]
    // Set the url to get a random image from Unsplash Source, given image dimensions
    const fixedImageUrls = [
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603018/IMG-20250601-WA0048_rlbwn3.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603017/IMG-20250601-WA0047_n5ct9h.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603016/IMG-20250530-WA0022_dtwfhb.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603016/IMG-20250601-WA0044_tzr66n.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603016/IMG-20250521-WA0057_n12gnn.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603015/IMG-20250521-WA0055_lvp9i4.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603015/IMG-20250521-WA0056_fiejvu.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603011/IMG-20250521-WA0051_raikl5.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603008/IMG-20250521-WA0050_kcl3jw.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603008/IMG-20250521-WA0047_iv4kqg.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603008/IMG-20250521-WA0046_yhw7hx.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603008/IMG-20250521-WA0049_e6v3gu.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749603007/IMG-20250521-WA0045_hx0rou.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602980/IMG-20250521-WA0044_prfjme.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602922/IMG-20250521-WA0042_o7ywu3.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602918/IMG-20250521-WA0039_jar6zv.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602918/IMG-20250521-WA0037_jsjo3n.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602916/IMG-20250521-WA0036_yvbkaa.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602915/IMG-20250521-WA0034_gcinz0.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602914/IMG-20250521-WA0027_jyizvk.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602913/IMG-20250513-WA0009_ys5qlc.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602910/IMG-20250513-WA0007_cgrhrs.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602909/IMG-20250513-WA0006_nxvf5s.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602909/IMG-20250513-WA0004_kbwbim.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602907/IMG-20250513-WA0001_uu9eia.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602908/IMG-20250513-WA0003_oqecz8.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602907/IMG-20250513-WA0002_laiqap.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602904/IMG-20250513-WA0000_o0v3ta.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602903/IMG-20250512-WA0107_w15qn8.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602902/IMG-20250501-WA0040_dneamz.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602901/IMG-20250501-WA0039_cjygb9.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602900/IMG-20250501-WA0038_da1q6z.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602900/IMG-20250501-WA0037_mcggsx.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602897/IMG-20250501-WA0036_jynfrk.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602895/IMG-20250501-WA0035_xr3x8x.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602895/IMG-20250501-WA0034_xfa7u7.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602895/IMG-20250501-WA0033_cavhi1.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602894/20250607_205702_wbodqu.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602892/20250607_205657_b8bz6c.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602891/20250601_151104_ooizb0.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602890/20250601_151052_tpwx5a.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602889/20250525_163309_qlvx85.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602889/20250601_151048_ijpqkg.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602887/20250430_194809_fibgvq.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602885/20250430_194743_1_rjn3ai.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602885/20250430_194743_r9vcrb.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602885/20250430_194717_ezxptd.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602884/20250430_194657_bgoowa.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602883/20250430_194542_s4ac7h.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602883/20250430_194533_fd9stx.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602882/20250430_194455_atxbez.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602881/20250430_194233_swjic2.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602880/20250430_194217_bv0m06.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602880/20250430_194226_bfhkrg.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602879/20250428_212424_gip2db.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602879/20250428_212417_bbljjo.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602878/20250425_182610_ys1auv.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602878/20250425_182641_eqfqyt.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749602878/20250425_182601_j2zrwy.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749604866/Imagem_do_WhatsApp_de_2025-06-10_%C3%A0_s_22.16.03_9f4e86c2_s04ide.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749604866/Imagem_do_WhatsApp_de_2025-06-10_%C3%A0_s_22.16.03_bd376f79_jc6t3t.jpg",
    "https://res.cloudinary.com/ddqdz2qyi/image/upload/v1749604867/casa_rqhgvy.jpg"
  ];


    // Defina a URL com base no índice
    const url = fixedImageUrls[index % fixedImageUrls.length]
    // Get the corresponding rect, to store more data needed (it is a normal Object)
    const rect = rects[index]
    // Create a new AbortController, to abort fetch if needed
    const { signal } = rect.controller = new AbortController()
    // Fetch the image
    fetch(url, { signal }).then(response => {
      // Get image URL, and if it was downloaded before, load another image
      // Otherwise, save image URL and set the texture
      const id = response.url.split('?')[0]
      if (imagesUrls[id]) {
        loadTextureForImage(index)
      } else {
        imagesUrls[id] = true
        image.texture = PIXI.Texture.from(response.url)
        rect.loaded = true
      }
    }).catch(() => {
      // Catch errors silently, for not showing the following error message if it is aborted:
      // AbortError: The operation was aborted.
    })
  }

  // Add solid rectangles and images
  function initRectsAndImages () {
    // Create a new Graphics element to draw solid rectangles
    const graphics = new PIXI.Graphics()
    // Select the color for rectangles
    graphics.beginFill(0x000000)
    // Loop over each rect in the list
    rects.forEach(rect => {
      // Create a new Sprite element for each image
      const image = new PIXI.Sprite()
      // Set image's position and size
      image.x = rect.x * gridSize
      image.y = rect.y * gridSize
      image.width = rect.w * gridSize - imagePadding
      image.height = rect.h * gridSize - imagePadding
      // Set it's alpha to 0, so it is not visible initially
      image.alpha = 0
      // Add image to the list
      images.push(image)
      // Draw the rectangle
      graphics.drawRect(image.x, image.y, image.width, image.height)
    })
    // Ends the fill action
    graphics.endFill()
    // Add the graphics (with all drawn rects) to the container
    container.addChild(graphics)
    // Add all image's Sprites to the container
    images.forEach(image => {
      container.addChild(image)
    })
  }

  // Check if rects intersects with the viewport
  // and loads corresponding image
  function checkRectsAndImages () {
    // Loop over rects
    rects.forEach((rect, index) => {
      // Get corresponding image
      const image = images[index]
      // Check if the rect intersects with the viewport
      if (rectIntersectsWithViewport(rect)) {
        // If rect just has been discovered
        // start loading image
        if (!rect.discovered) {
          rect.discovered = true
          loadTextureForImage(index)
        }
        // If image is loaded, increase alpha if possible
        if (rect.loaded && image.alpha < 1) {
          image.alpha += 0.01
        }
      } else { // The rect is not intersecting
        // If the rect was discovered before, but the
        // image is not loaded yet, abort the fetch
        if (rect.discovered && !rect.loaded) {
          rect.discovered = false
          rect.controller.abort()
        }
        // Decrease alpha if possible
        if (image.alpha > 0) {
          image.alpha -= 0.01
        }
      }
    })
  }

  // Check if a rect intersects the viewport
  function rectIntersectsWithViewport (rect) {
    return (
      rect.x * gridSize + container.x <= width &&
      0 <= (rect.x + rect.w) * gridSize + container.x &&
      rect.y * gridSize + container.y <= height &&
      0 <= (rect.y + rect.h) * gridSize + container.y
    )
  }

  // Start listening events
  function initEvents () {
    // Make stage interactive, so it can listen to events
    app.stage.interactive = true

    // Pointer & touch events are normalized into
    // the `pointer*` events for handling different events
    app.stage
      .on('pointerdown', onPointerDown)
      .on('pointerup', onPointerUp)
      .on('pointerupoutside', onPointerUp)
      .on('pointermove', onPointerMove)
  }

  // On pointer down, save coordinates and set pointerDownTarget
  function onPointerDown (e) {
    const { x, y } = e.data.global
    pointerDownTarget = 1
    pointerStart.set(x, y)
    pointerDiffStart = uniforms.uPointerDiff.clone()
  }

  // On pointer up, set pointerDownTarget
  function onPointerUp () {
    pointerDownTarget = 0
  }

  // On pointer move, calculate coordinates diff
  function onPointerMove (e) {
    const { x, y } = e.data.global
    if (pointerDownTarget) {
      diffX = pointerDiffStart.x + (x - pointerStart.x)
      diffY = pointerDiffStart.y + (y - pointerStart.y)
      diffX = diffX > 0 ? Math.min(diffX, centerX + imagePadding) : Math.max(diffX, -(centerX + widthRest))
      diffY = diffY > 0 ? Math.min(diffY, centerY + imagePadding) : Math.max(diffY, -(centerY + heightRest))
    }
  }

  // Init everything
  function init () {
    initDimensions()
    initUniforms()
    initGrid()
    initApp()
    initBackground()
    initContainer()
    initRectsAndImages()
    initEvents()

    // Zoom com a roda do mouse
    view.addEventListener('wheel', (event) => {
      event.preventDefault()
      const scaleFactor = 1.1
      if (event.deltaY < 0) {
        container.scale.x *= scaleFactor
        container.scale.y *= scaleFactor
      } else {
        container.scale.x /= scaleFactor
        container.scale.y /= scaleFactor
      }
    }, { passive: false })


        // Animation loop
    // Code here will be executed on every animation frame
    app.ticker.add(() => {
      // Multiply the values by a coefficient to get a smooth animation
      uniforms.uPointerDown += (pointerDownTarget - uniforms.uPointerDown) * 0.075
      uniforms.uPointerDiff.x += (diffX - uniforms.uPointerDiff.x) * 0.2
      uniforms.uPointerDiff.y += (diffY - uniforms.uPointerDiff.y) * 0.2
      // Set position for the container
      container.x = uniforms.uPointerDiff.x - centerX
      container.y = uniforms.uPointerDiff.y - centerY
      // Check rects and load/cancel images as needded
      checkRectsAndImages()
    })
  }

  // Clean the current Application
  function clean () {
    // Stop the current animation
    app.ticker.stop()

    // Remove event listeners
    app.stage
      .off('pointerdown', onPointerDown)
      .off('pointerup', onPointerUp)
      .off('pointerupoutside', onPointerUp)
      .off('pointermove', onPointerMove)

    // Abort all fetch calls in progress
    rects.forEach(rect => {
      if (rect.discovered && !rect.loaded) {
        rect.controller.abort()
      }
    })
  }

  // On resize, reinit the app (clean and init)
  // But first debounce the calls, so we don't call init too often
  let resizeTimer
  function onResize () {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      clean()
      init()
    }, 200)
  }
  // Listen to resize event
  window.addEventListener('resize', onResize)

  // Load resources, then init the app
  PIXI.Loader.shared.add([
    'shaders/stageFragment.glsl',
    'shaders/backgroundFragment.glsl'
  ]).load(init)

})()
