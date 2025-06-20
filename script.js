window.addEventListener("DOMContentLoaded", function () {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect;
      this.x = Math.random() * this.effect.canvasWidth;
      this.y = 0;
      this.color = color;
      this.originX = x;
      this.originY = y;
      this.size = this.effect.gap;
      // this.size = this.effect.gap - 1;
      this.dx = 0;
      this.dy = 0;
      this.vx = 0;
      this.vy = 0;
      this.force = 0;
      this.angle = 0;
      this.distance = 0;
      this.friction = Math.random() * 0.3 + 0.15;
      this.ease = Math.random() * 0.1 + 0.05;
    }
    draw() {
      this.effect.context.fillStyle = this.color;
      this.effect.context.fillRect(this.x,this.y, this.size, this.size);
    }
    update() {
      this.dx = this.effect.mouse.x - this.x;
      this.dy = this.effect.mouse.y - this.y;
      this.distance = this.dx * this.dx + this.dy * this.dy;
      this.force = -this.effect.mouse.radius / this.distance;
      if(this.distance < this.effect.mouse.radius){
        this.angle = Math.atan2(this.dy, this.dx);
        this.vx += this.force * Math.cos(this.angle);
        this.vy += this.force * Math.sin(this.angle);
      }
      this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
      this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    }
  }
  class Effect {
    constructor(context, canvasWidth, canvasHeight) {
      this.context = context;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;
      this.fontSize = 100;
      this.lineHeight = this.fontSize * 1.2;
      this.maxTextWidth = this.canvasWidth * 0.9;
      this.textInput = document.getElementById("textInput");
      this.textInput.addEventListener('keyup', (e)=> {    
      if(e.key !== ' '){
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
            this.wrapText(e.target.value);
            
          }
        })
        this.textInput.addEventListener("input", (e) => {
        // if (e.target.value.trim() !== " ") {
        //   this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        //   this.wrapText(e.target.value);
        // }
          this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
          this.wrapText(e.target.value);
        
      });
        // particle text
        this.particles = [];
        this.gap = 2;
        this.mouse = {
          radius: 2000,
          x: 0,
          y: 0,
        }
        window.addEventListener('mousemove', (e) => {
          this.mouse.x = e.x;
          this.mouse.y = e.y;
        });
       window.addEventListener('touchstart', e => {
             e.preventDefault();    
            this.mouse.x = e.touches[0].clientX;
            this.mouse.y = e.touches[0].clientY;            
          });
          
          window.addEventListener('touchend', e => {
             e.preventDefault(); 
            
          });
          
          window.addEventListener('touchmove', e => { 
             e.preventDefault();           
              this.mouse.x = e.touches[0].clientX;
              this.mouse.y = e.touches[0].clientY;            
          });
        
    }
    wrapText(text) {
      const gradient = this.context.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
      gradient.addColorStop("0.4", "#dc0155");
      gradient.addColorStop("0.5", "#ff9920");
      gradient.addColorStop("0.6", "#ffc548");
      gradient.addColorStop("0.7", "#e8e8e8");
      this.context.fillStyle = gradient;
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.lineWidth = 3;
      // this.context.strokeStyle = gradient;
      this.context.font = this.fontSize + "px Impact";
      // break multiline text
      let linesArray = [];      
      let words = text.split(" ");
      let lineCounter = 0;
      let line = "";
      for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";
        if (this.context.measureText(testLine).width > this.maxTextWidth) {
          line = words[i] + " ";
          lineCounter++;
        } else {
          line = testLine;
        }
        linesArray[lineCounter] = line;
      }
      let textHeight = this.lineHeight * lineCounter;
      this.textY = this.canvasHeight / 2 - textHeight/2;
      linesArray.forEach((el, index) => {
        this.context.fillText(el, this.textX, this.textY + (index * this.lineHeight));
        // this.context.strokeText(el, this.textX, this.textY + (index * this.lineHeight));
    
    });
    this.convertToParticles();
    }
    convertToParticles() {
      this.particles = [];
      const pixels = this.context.getImageData(0,0, this.canvasWidth, this.canvasHeight).data;
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      for (let y = 0; y < this.canvasHeight; y+=this.gap) {
        for (let x = 0; x < this.canvasWidth; x+=this.gap) {
         const index = (y * this.canvasWidth + x) * 4;
         const alpha = pixels[index + 3];
         if(alpha > 0){
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const color = 'rgb(' + red + ', ' + green + ', ' + blue + ')';       
          this.particles.push(new Particle(this, x, y, color))
         }
        }
       
      }
      // console.log(this.particles);
      
    }
    render() {
      this.particles.forEach(particle => {
        particle.update();
        particle.draw();
      })
    }
    resize(width, height){
      this.canvasWidth = width;
      this.canvasHeight = height;
      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;      
      this.maxTextWidth = this.canvasWidth * 0.9;
    }
  }

  const effect = new Effect(ctx, canvas.width, canvas.height);

  effect.wrapText(effect.textInput.value);
  // effect.wrapText("hello hello hello hello hello");
  effect.render();
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.render();
    requestAnimationFrame(animate);
    
    
  }
animate();
window.addEventListener('resize', function(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  effect.resize(canvas.width, canvas.height);
  effect.wrapText(effect.textInput.value);
})

});
