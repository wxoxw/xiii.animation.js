# xiii.animation.js #
DOMアニメーションを簡単に実装するためのJavaScriptライブラリ

## Function ##

##### アニメーションを作成する #####

    XIII.animation.to(target:Element, properties:Object, time:Number = 1, easing:String = "ease", delay:Number = 0):XIII.animation.Core

使用例

```html
<script src="xiii.animation.compiled.js"></script>
<script>

  var rect = document.createElement("div");

  rect.style.position = "absolute";
  rect.style.width = "100px";
  rect.style.height = "100px";
  rect.style.left = "0px";
  rect.style.top = "0px";
  rect.style.backgroundColor = "#ccf";

  document.body.appendChild(rect);

  XIII.animation.to(rect, {transform: "translate(100px, 100px)", opacity: "0.5"}, 1, "ease-in-out").start();

</script>
```

##### 直列に実行されるアニメーショングループを作成する #####

    XIII.animation.serial(...animations):XIII.animation.Core

引数には XIII.animation.to 以外にも以下の値を指定できる
- 配列 ... 配列の中は並列処理される
- 数値 ... 指定した数値分処理を待機させる
- 文字 ... 指定した文字列がコンソールに表示される
- 関数 ... 指定した関数が実行される

使用例

```html
<script src="xiii.animation.compiled.js"></script>
<script>

  var rect = document.createElement("div");

  rect.style.position = "absolute";
  rect.style.width = "100px";
  rect.style.height = "100px";
  rect.style.left = "0px";
  rect.style.top = "0px";
  rect.style.backgroundColor = "#ccf";

  document.body.appendChild(rect);

  XIII.animation.serial(
    XIII.animation.to(rect1, {transform: "translate(200px, 200px)"}, 1, "ease-out"),
    XIII.animation.to(rect1, {transform: "translate(200px, 200px) scale(2)"}, 1, "ease-out"),
    XIII.animation.to(rect1, {transform: "translate(200px, 200px) scale(2) rotate(45deg)"}, 1, "ease-out"),
    XIII.animation.to(rect1, {opacity: "0"}, 1, "ease-out")
  ).start();

</script>
```

##### 並列に実行されるアニメーショングループを作成する #####

    XIII.animation.parallel(...animations):XIII.animation.Core

引数には XIII.animation.to 以外にも以下の値を指定できる
- 配列 ... 配列の中は直列処理される
- 数値 ... 指定した数値分処理を待機させる
- 文字 ... 指定した文字列がコンソールに表示される
- 関数 ... 指定した関数が実行される

使用例

```html
<script src="xiii.animation.compiled.js"></script>
<script>

  var rect1 = document.createElement("div");

  rect1.style.position = "absolute";
  rect1.style.width = "100px";
  rect1.style.height = "100px";
  rect1.style.left = "0px";
  rect1.style.top = "0px";
  rect1.style.backgroundColor = "#fcc";

  var rect2 = document.createElement("div");

  rect2.style.position = "absolute";
  rect2.style.width = "100px";
  rect2.style.height = "100px";
  rect2.style.left = "0px";
  rect2.style.top = "0px";
  rect2.style.backgroundColor = "#ccf";
  rect2.style.transform = "translate(400px, 0px)";

  document.body.appendChild(rect1);
  document.body.appendChild(rect2);

  XIII.animation.parallel(
    [
      XIII.animation.to(rect1, {transform: "translate(150px, 0px)"}, 2, "cubic-bezier(0.5, 0, 1, 0.5)"),
      XIII.animation.to(rect1, {transform: "translate(0px, 0px)"}, 1, "cubic-bezier(0, 0.5, 0.5, 1)")
    ],
    [
      XIII.animation.to(rect2, {transform: "translate(250px, 0px)"}, 2, "cubic-bezier(0.5, 0, 1, 0.5)"),
      XIII.animation.to(rect2, {transform: "translate(400px, 0px)"}, 1, "cubic-bezier(0, 0.5, 0.5, 1)")
    ]
  ).start();

</script>
```

##### 繰り返し実行されるアニメーショングループを作成する #####

    XIII.animation.loop(...animations):XIII.animation.Core

引数には XIII.animation.to 以外にも以下の値を指定できる
- 配列 ... 配列の中は並列処理される
- 数値 ... 指定した数値分処理を待機させる
- 文字 ... 指定した文字列がコンソールに表示される
- 関数 ... 指定した関数が実行される

使用例

```html
<script src="xiii.animation.compiled.js"></script>
<script>

  var rect = document.createElement("div");

  rect.style.position = "absolute";
  rect.style.width = "100px";
  rect.style.height = "100px";
  rect.style.left = "0px";
  rect.style.top = "0px";
  rect.style.backgroundColor = "#ccf";

  document.body.appendChild(rect);

  XIII.animation.loop(
    XIII.animation.to(rect, {transform: "translate(200px, 0px)"}),
    XIII.animation.to(rect, {transform: "translate(200px, 200px)"}),
    XIII.animation.to(rect, {transform: "translate(0px, 200px)"}),
    XIII.animation.to(rect, {transform: "translate(0px, 0px)"})
  ).start();

</script>
```

## Constructor ##

##### XIII.animation.Core #####

- start():void ... アニメーションを開始する
- stop():void ... アニメーションを停止する
- toggle():void ... アニメーション中であれば停止し、停止中であれば開始する
- dispose():void ... データを破棄する

## Browser ##
- Google Chrome
- FireFox
- Opera
- IE10+
- Androidブラウザ
