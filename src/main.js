
import Phaser from "phaser";
import "./style.css";

class MoonGame extends Phaser.Scene {
  constructor() {
    super("MoonGame");
  }

  create() {
    // Game world
    this.cameras.main.setBackgroundColor("#080d1c");

    // Stars
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 440);
      const size = Phaser.Math.Between(1, 3);

      this.add.circle(x, y, size, 0xffffff, 0.8);
    }

    // Distant planet
    this.add.circle(790, 145, 65, 0x53658d, 0.8);
    this.add.circle(770, 125, 15, 0x7789ae, 0.5);

    // Moon surface
    const ground = this.add.graphics();
    ground.fillStyle(0x777b89, 1);
    ground.fillPoints([
      { x: 0, y: 475 },
      { x: 160, y: 450 },
      { x: 340, y: 470 },
      { x: 540, y: 445 },
      { x: 760, y: 465 },
      { x: 960, y: 440 },
      { x: 960, y: 600 },
      { x: 0, y: 600 }
    ], true);

    // Lunar craters
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(20, 930);
      const y = Phaser.Math.Between(490, 570);
      const radius = Phaser.Math.Between(8, 22);

      this.add.ellipse(x, y, radius * 2, radius, 0x555967, 0.6);
    }

    // Astronaut
    this.astronaut = this.add.container(150, 400);

    const suit = this.add.graphics();
    suit.fillStyle(0xffffff);
    suit.fillRoundedRect(-13, -8, 26, 36, 8);
    suit.fillStyle(0x9bdcff);
    suit.fillCircle(0, -22, 15);
    suit.fillStyle(0x253b61);
    suit.fillCircle(0, -22, 10);
    suit.fillStyle(0xffffff);
    suit.fillRoundedRect(-19, 0, 8, 22, 4);
    suit.fillRoundedRect(11, 0, 8, 22, 4);
    suit.fillRoundedRect(-10, 23, 8, 12, 3);
    suit.fillRoundedRect(2, 23, 8, 12, 3);

    this.astronaut.add(suit);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");

    // Energy crystals
    this.crystals = [];
    const positions = [
      [300, 425],
      [450, 390],
      [610, 420],
      [740, 400],
      [850, 420]
    ];

    positions.forEach(([x, y]) => {
      const crystal = this.add.polygon(
        x, y, [0, -13, 11, 0, 0, 13, -11, 0],
        0x38e8ff
      );

      crystal.setStrokeStyle(2, 0xffffff);
      this.crystals.push(crystal);
    });

    // Game information
    this.collected = 0;
    this.oxygen = 100;
    this.elapsed = 0;
    this.gameOver = false;

    this.title = this.add.text(25, 20, "LUNAR EXPLORER", {
      fontSize: "26px",
      color: "#ffffff",
      fontStyle: "bold"
    });

    this.status = this.add.text(25, 65, "", {
      fontSize: "17px",
      color: "#b8d8ff",
      lineSpacing: 8
    });

    this.instructions = this.add.text(
      25, 540,
      "MOVE: WASD / ARROW KEYS     OBJECTIVE: COLLECT 5 ENERGY CRYSTALS",
      {
        fontSize: "13px",
        color: "#ffffff"
      }
    );

    this.refreshStatus();
  }

  refreshStatus() {
    this.status.setText(
      `OXYGEN: ${Math.ceil(this.oxygen)}%     ENERGY: ${this.collected}/5`
    );
  }

  update(time, delta) {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey("R"))) {
        this.scene.restart();
      }
      return;
    }

    const speed = 220;
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.keys.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.keys.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.keys.S.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const direction = new Phaser.Math.Vector2(dx, dy).normalize();
      this.astronaut.x += direction.x * speed * delta / 1000;
      this.astronaut.y += direction.y * speed * delta / 1000;
    }

    // Keep astronaut inside the playable area
    this.astronaut.x = Phaser.Math.Clamp(this.astronaut.x, 25, 935);
    this.astronaut.y = Phaser.Math.Clamp(this.astronaut.y, 350, 455);

    // Collect nearby energy crystals
    this.crystals = this.crystals.filter((crystal) => {
      if (
        Phaser.Math.Distance.Between(
          this.astronaut.x,
          this.astronaut.y,
          crystal.x,
          crystal.y
        ) < 35
      ) {
        crystal.destroy();
        this.collected++;
        this.refreshStatus();
        return false;
      }

      return true;
    });

    // Oxygen slowly decreases
    this.elapsed += delta;
    if (this.elapsed >= 1000) {
      this.oxygen = Math.max(0, this.oxygen - 1);
      this.elapsed = 0;
      this.refreshStatus();
    }

    if (this.collected === 5) {
      this.finishGame("MISSION COMPLETE!");
    } else if (this.oxygen <= 0) {
      this.finishGame("OXYGEN DEPLETED!");
    }
  }

  finishGame(message) {
    this.gameOver = true;

    this.add.rectangle(480, 300, 520, 170, 0x101b32, 0.95)
      .setStrokeStyle(2, 0x38e8ff);

    this.add.text(480, 275, message, {
      fontSize: "30px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(480, 325, "Press R to restart", {
      fontSize: "18px",
      color: "#38e8ff"
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 600,
  parent: "game-container",
  backgroundColor: "#080d1c",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MoonGame]
};

new Phaser.Game(config);
