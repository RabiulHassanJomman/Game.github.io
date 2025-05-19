class Enemy {
    constructor(x, y, radius, color, velocity) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.velocity = velocity;
    }
  
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  
    update() {
      this.x += this.velocity.x;
      this.y += this.velocity.y;
    }
  }
  class Player extends Enemy {}
  class Projectile extends Enemy {}
  
  class Particle {
    constructor(x, y, radius, color, velocity) {
      this.firction = 0.99;
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.velocity = velocity;
      this.alpha = 1;
    }
  
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  
    update() {
      this.velocity.x *= this.firction;
      this.velocity.y *= this.firction;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.alpha -= 0.1;
    }
  }
  
  
  let canvas = document.getElementById("canvas");
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  
  const GAME_WIDTH = canvas.width;
  const GAME_HEIGHT = canvas.height;
  
  let score = 0;
  let scoreEl = document.getElementById("scoreEl");
  let startGameBtn = document.getElementById("startBtn");
  let modalEl = document.getElementById("modalEl");
  let bigScoreEl = document.getElementById("bigScoreEl");
  let ctx = canvas.getContext("2d");
  
  let player = new Player(GAME_WIDTH / 2, GAME_HEIGHT / 2, 12, "white");
  let projectiles = [];
  let enemies = [];
  let particles = [];
  
  function init() {
    player = new Player(GAME_WIDTH / 2, GAME_HEIGHT / 2, 12, "white");
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
  }
  
  let setIntervalId;
  
  function spawnEnemy() {
    setIntervalId = setInterval(() =>
    {
      let x = 0;
      let y = 0;
      const radius = Math.random() * (30 - 5) + 5;
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : GAME_WIDTH + radius;
        y = Math.random() * GAME_HEIGHT + radius;
      } else {
        x = Math.random() * GAME_WIDTH + radius;
        y = Math.random() < 0.5 ? 0 - radius : GAME_HEIGHT + radius;
      }
  
      const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
      const angle = Math.atan2(GAME_HEIGHT / 2 - y, GAME_WIDTH / 2 - x);
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };
  
      enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
  }
  
  window.addEventListener("click", (event) => {
    let angle = Math.atan2(event.clientY - GAME_HEIGHT / 2, event.clientX - GAME_WIDTH / 2);
    let velocity = {
      x: Math.cos(angle) * 4,
      y: Math.sin(angle) * 4
    };
    projectiles.push(new Projectile(GAME_WIDTH / 2, GAME_HEIGHT / 2, 4, "white", velocity));
  });
  
  
  // ANIMATION LOOP
  let animationId;
  
  function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
    player.draw(ctx);
    particles.forEach((particle, particleIndex) => {
      particle.draw(ctx);
      particle.update();
      if (particle.alpha <= 0)
        particles.splice(particleIndex, 1);
    });
  
    projectiles.forEach((projectile, projectileIndex) => {
      projectile.draw(ctx);
      projectile.update();
  
      if (projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > GAME_WIDTH ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > GAME_HEIGHT)
      {
        projectiles.splice(projectileIndex, 1);
      }
    });
    enemies.forEach((enemy, enemyIndex) => {
      enemy.draw(ctx);
      enemy.update();
  
      // ENEMY COLLISION WITH PLAYER 
      let dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (dist - player.radius - enemy.radius < 1) {
        clearInterval(setIntervalId);
        cancelAnimationFrame(animationId);
        bigScoreEl.innerHTML = score;
        modalEl.style.display = "flex";
      }
  
      // ENEMY COLLISION WITH PROJECTILE 
      projectiles.forEach((projectile, projectileIndex) => {
        let dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
        if (dist - projectile.radius - enemy.radius < 1) {
          for (var i = 0; i < enemy.radius; i++) {
            particles.push(new Particle(
              enemy.x,
              enemy.y,
              Math.random() * 1.3,
              enemy.color,
              {
                x: (Math.random() - 0.5) * Math.random() * 8,
                y: (Math.random() - 0.5) * Math.random() * 8
              }));
          }
          if (enemy.radius > 15) {
            score += 50;
            gsap.to(enemy, { radius: enemy.radius - 10 });
            setTimeout(function() {
              projectiles.splice(projectileIndex, 1);
            }, 0);
          } else {
            setTimeout(function() {
              projectiles.splice(projectileIndex, 1);
              enemies.splice(enemyIndex, 1);
              score += 100;
              scoreEl.innerHTML = score;
            }, 0);
          }
        }
      });
    });
  }
  
  startGameBtn.addEventListener("click", () => {
    init();
    modalEl.style.display = "none";
    animate();
    spawnEnemy();
  });
