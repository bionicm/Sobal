
### フロントエンドの環境構築
1. Node.js 12.14.0のインストール(未導入の場合)  
https://nodejs.org/download/release/v12.14.0/  
node-v12.14.0-x64.msi から、インストーラーをダウンロードして実行する
2. コマンドプロンプトを起動する  
3. Angularのインストール  
`npm install -g @angular/cli@8.3.21`
4. webディレクトリに移動  
`cd web`
5. ライブラリのインストール  
`npm install`


### バックエンドの環境構築
1. Python 3.7.6のインストール(未導入の場合)  
https://www.python.org/downloads/release/python-376/  
Windows x86-64 executable installer から、インストーラーをダウンロードして実行する
2. コマンドプロンプトを起動する  
3. apiディレクトリに移動  
`cd api`
4. ライブラリのインストール  
`pip install -r requirements.txt -t lib`


### widget.jsonの設定
- web/src/assets/widgets配下にあるwidget.jsonを修正する


### バックエンドの起動
1. コマンドプロンプトを起動する  
2. apiディレクトリに移動する  
`cd api`
3. サーバーを起動する  
`python src/route.py`


### フロントエンドの起動
1. コマンドプロンプトを起動する  
2. webディレクトリに移動する  
`cd web`
3. サーバーを起動する  
`ng serve`
4. ブラウザでページを開く  
http://localhost:4200/


### その他
- PINコードは1111にしています
