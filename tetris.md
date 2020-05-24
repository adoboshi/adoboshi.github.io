---
layout: page
title: Tetris
---
<canvas id="can"></canvas>
<script src="tetris.js"></script>


## 概要
JavaScriptとcanvas（html5）で作りました。製作期間は約一週間。<br>
ルールはテトリスのガイドラインに（ほぼ）準拠しているはず。<br>
[ソースコード（github）](https://github.com/adoboshi/adoboshi.github.io/blob/master/tetris.js)

***
## 操作方法
- 左右移動：←、→
- ソフトドロップ：↓
- ハードドロップ：↑
- 右回転：X
- 左回転：Z
- ホールド：スペース

***
## 参考にしたサイト
### [プログラミング講座 第13回【テトリスを作る(1)/JavaScript】](https://youtu.be/LJlKaTwtSdI)
Youtube, Akichonさん

JavaScriptでゲームを作る方法をこの動画で学びました。テトリスが完成するまでの過程を全て見ることができ、大変参考になりました。

### [テトリス（tetris）のガイドラインを理解する](https://qiita.com/ki_ki33/items/35566f052af7b916607b)
Qiita, @ki_ki33さん

テトリスの公式ルール（＝ガイドライン）がわかりやすく解説されています。ここで紹介されている要素は全て実装しました。

### [SRS (Super Rotation System)](https://tetrisch.github.io/main/srs.html)
Tetrisチャンネルさん

ガイドラインに含まれる項目のうち、SRS（スーパーローテーションシステム）の内容が具体的に示されています。SRSによりTスピンなどの回転入れが可能になります。

### [ワールドルールテトリスの作り方またはRust入門した感想的な何か](https://qiita.com/namn1125/items/15ddea322c086aa1b0d3)
Qiita, @namn1125さん

Rustでガイドライン準拠テトリスを作られた先駆者様（？）です。この記事を読んで各機能の実装のイメージがつかめました。

### [テンプレ積み保管庫](http://waka.nu/tetris/)
喜竹屋本舗さん

各ミノの回転入れの形やTスピンの詳細などが載っています。

***
## ToDo
- REN
- Back-to-Back
- パーフェクトクリア
- スコア実装
- ~~メニュー実装~~
- モード追加
	- ~~難易度~~
	- 40ライン
	- スコアアタック（n分）
	- 堀
- ランキング機能（バックエンド勉強後）