import Phaser from 'phaser'
import Sprite = Phaser.Physics.Arcade.Sprite

export class TestScene extends Phaser.Scene {
  platforms: Phaser.Physics.Arcade.StaticGroup
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  stars: Phaser.Physics.Arcade.Group
  score = 0
  scoreText: Phaser.GameObjects.Text
  bombs: Phaser.Physics.Arcade.Group
  gameOver = false

  constructor() {
    super('TestScene')
  }

  preload() {
    this.load.setPath('assets')
    this.load.image('sky', 'sky.png')
    this.load.image('ground', 'platform.png')
    this.load.image('star', 'star.png')
    this.load.image('bomb', 'bomb.png')
    this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 })
  }

  create() {
    this.add.image(400, 300, 'sky')
    this.platforms = this.physics.add.staticGroup()
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()
    this.platforms.create(600, 400, 'ground')
    this.platforms.create(50, 250, 'ground')
    this.platforms.create(750, 220, 'ground')
    this.player = this.physics.add.sprite(100, 450, 'dude')
    this.player.setBounce(0.2)
    this.player.setCollideWorldBounds(true)
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    })

    this.player.body.setGravityY(300)
    this.physics.add.collider(this.player, this.platforms)
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    })
    this.stars.children.iterate(function (child) {
      ;(child as Sprite).setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
      return true
    })
    this.physics.add.collider(this.stars, this.platforms)
    this.physics.add.overlap(this.player, this.stars, this.collectStar)
    this.scoreText = this.add.text(16, 16, 'score: 0', {
      fontSize: '32px',
      color: '#000',
    })
    this.bombs = this.physics.add.group()
    this.physics.add.collider(this.bombs, this.platforms)
    this.physics.add.collider(this.player, this.bombs, this.hitBomb)
  }

  update(time: number, delta: number) {
    super.update(time, delta)
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160)
      this.player.anims.play('left', true)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160)
      this.player.anims.play('right', true)
    } else {
      this.player.setVelocityX(0)
      this.player.anims.play('turn')
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-530)
    }
  }

  collectStar: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (player, star) => {
    ;(star as Phaser.Physics.Arcade.Sprite).disableBody(true, true)
    this.score += 10
    this.scoreText.setText('Score: ' + this.score)
    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate(function (child) {
        ;(child as Phaser.Physics.Arcade.Sprite).enableBody(
          true,
          (child as Phaser.Physics.Arcade.Sprite).x,
          0,
          true,
          true,
        )
        return null
      })

      const x =
        (player as Phaser.Physics.Arcade.Sprite).x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400)

      const bomb = this.bombs.create(x, 16, 'bomb')
      bomb.setBounce(1)
      bomb.setCollideWorldBounds(true)
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    }
  }

  hitBomb: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (player, _bomb) => {
    this.physics.pause()
    ;(player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000)
    ;(player as Phaser.Physics.Arcade.Sprite).anims.play('turn')
    this.gameOver = true
  }
}
