import Ember from 'ember';

const {
  Component,
  get,
  set
} = Ember;

export default Component.extend({
  score: 0,
  cursors: null,
  platforms: null,
  player: null,
  scoreText: 'Score: 0',
  stars: null,

  didRender() {
    let game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
      preload: this._preload,
      create: this._create.bind(this),
      update: this._update.bind(this)
    });
    this._super(...arguments);
  },

  _preload(game) {
    game.load.image('sky', '/assets/images/sky.png');
    game.load.image('ground', '/assets/images/platform.png');
    game.load.image('star', '/assets/images/star.png');
    game.load.spritesheet('dude', '/assets/images/dude.png', 32, 48);
  },

  _create(game) {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.add.sprite(0, 0, 'sky');

    this._setupPlatforms(game);
    this._setupPlayer(game);
    this._setupStars(game);

    let scoreText = game.add.text(16, 16, 'score: 0', {
      fontSize: '32px',
      fill: '#000'
    });

    set(this, 'cursors', game.input.keyboard.createCursorKeys());
    set(this, 'scoreText', scoreText);
    set(this, 'score', 0);
  },

  _update(game) {
    let platforms = get(this, 'platforms');
    let stars = get(this, 'stars');
    let player = get(this, 'player');

    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    game.physics.arcade.overlap(player, stars, (player, star) => {
      star.kill();

      let score = get(this, 'score') + 10;
      set(this, 'score', score);
      set(this, 'scoreText.text', `Score: ${score}`);
    });

    this._playerAnimation(game);
  },

  _setupPlayer(game) {
    let player = game.add.sprite(32, game.world.height - 150, 'dude');

    game.physics.arcade.enable(player);

    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    set(this, 'player', player);
  },

  _setupPlatforms(game) {
    let platforms = game.add.group();
    platforms.enableBody = true;

    let ground = platforms.create(0, game.world.height - 64, 'ground');
    ground.scale.setTo(2, 2);
    ground.body.immovable = true;

    let ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-100, 400, 'ground');
    ledge.body.immovable = true;
    set(this, 'platforms', platforms);
    set(this, 'ground', ground);
  },

  _setupStars(game) {
    let stars = game.add.group();

    stars.enableBody = true;

    for (let i = 0; i < 12; i++) {
      let star = stars.create(i * 70, 0, 'star');
      star.body.gravity.y = 300;
      star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
    set(this, 'stars', stars);
  },

  _playerAnimation(game) {
    let player = get(this, 'player');
    let cursors = get(this, 'cursors');
    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
      player.body.velocity.x = -150;

      player.animations.play('left');
    } else if (cursors.right.isDown) {
      player.body.velocity.x = 150;

      player.animations.play('right');
    } else {
      player.animations.stop();

      player.frame = 4;
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.body.velocity.y = -350;
    }
  }
});
