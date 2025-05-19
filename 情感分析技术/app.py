# sentiment_api.py
from flask import Flask, request, jsonify
from flask_cors import CORS  
from networks import SentimentAnalysis
import traceback

app = Flask(__name__)
CORS(app)  # 允许所有跨域请求
SA = SentimentAnalysis()

@app.route('/analyze', methods=['get'])
def analyze():
    try:
        text = request.args.get('text')
        print(text)
        if not text:
            return jsonify({"code": 400, "error": "Text cannot be empty"}), 400

        text = text.strip()
        if not text:
            return jsonify({"code": 400, "error": "Text cannot be empty"}), 400

        # 执行情感分析
        score1, score0 = SA.normalization_score(text)
        result = 1 if score1 > score0 else (-1 if score1 < score0 else 0)

        return jsonify({
            "code": 200,
            "sentiment": result,
            "text": text
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "code": 500,
            "error": f"Analysis failed: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)