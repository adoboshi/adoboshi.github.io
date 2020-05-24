# Markdownについて
## Markdownを使うメリット
* 執筆の高速化
	* パーサを用いることでhtmlコードに変換可能
		* パーサの例：[marked](https://github.com/chjj/marked)
		* [Markdownを「Marked.js」を使ってHTMLに変換する方法](https://www.suzu6.net/posts/38/)
		* [Markdown Blog Editor](https://yosiakatsuki.net/blog/markdown-blog-editor/)
* 装飾（CSS）の簡素化
	* 規則的に書かれているため、毎回CSSを流用可能
* オフラインでも使用可能
	* 仕事でも使えるのでは？

# Tips
## 改行の方法
* 文末に半角空白スペースを2つつける
* 1行空白の行を入れる
* &lt;br&gt;タグを使う

参考：[改行を意識せずMarkdownを書く方法とは？](https://www.sejuku.net/blog/77336)

## code記法
* 一行のときはバッククオート（&#96;）で囲めばOK  
* 例：一行は &#96;`バッククオート`&#96; で囲みます

## シンタックスハイライト
[highlight.js](https://highlightjs.org/)
```c++
#include <bits/stdc++.h>
using namespace std;

int main() {
	int n;
	cin >> n;
	cout << (double) n * n * acos(-1) << endl;
	return 0;
}
```

# おすすめエディタ
* Typora
* Atom
* Visual Stuido Code
* Markdown New Tab【Chrome拡張機能】

参考：[Markdownが書ける「簡単・高機能・OS依存なし」のエディタ厳選4選！](https://www.sejuku.net/blog/77296)

# 参考リンク
* [Markdown記法 サンプル集](https://qiita.com/tbpgr/items/989c6badefff69377da7)
* [HTML特殊文字コード表](http://www.shurey.com/js/labo/character.html)
