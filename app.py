import streamlit as st
import streamlit.components.v1 as components
import os
import urllib.parse

# 1. 页面配置
st.set_page_config(
    page_title="LG Subscribe | Partner Showroom",
    page_icon="🔴",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# 2. 隐藏 Streamlit 默认样式
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    section.main > div {padding: 0;}
    iframe {border: none; width: 100vw; height: 100vh;}
    .stApp {background: white;}
    div[data-testid="stVerticalBlock"] {gap: 0;}
    </style>
""", unsafe_allow_html=True)

def main():
    # 安全获取 API_KEY (来自 Streamlit Secrets)
    api_key = st.secrets.get("API_KEY", "")

    # 获取当前 URL 参数（用于下线推广）
    params = st.query_params
    wa = params.get("wa", "")
    name = params.get("name", "")
    query_str = f"?wa={wa}&name={urllib.parse.quote(name)}" if wa else ""

    # 寻找构建目录
    current_dir = os.path.dirname(__file__)
    dist_index = os.path.join(current_dir, "dist", "index.html")
    
    if os.path.exists(dist_index):
        try:
            with open(dist_index, 'r', encoding='utf-8') as f:
                html_content = f.read()
                
            # 核心修复：注入 API_KEY 和参数处理脚本
            # 这里的 window.process 模拟了 Vite 的环境变量，让 frontend 能识别
            injection = f"""
            <base href="./">
            <script>
                window.process = {{ env: {{ API_KEY: "{api_key}" }} }};
                if (!window.location.search && "{wa}") {{
                    const newUrl = window.location.pathname + "{query_str}" + window.location.hash;
                    window.history.replaceState(null, '', newUrl);
                }}
            </script>
            """
            html_content = html_content.replace('<head>', f'<head>{injection}')
            
            # 渲染 HTML
            components.html(html_content, height=2000, scrolling=True)
            
        except Exception as e:
            st.error(f"读取文件失败: {e}")
    else:
        # 引导界面
        st.markdown(f"""
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; font-family: sans-serif; text-align: center;">
            <h1 style="color: #e60044; font-size: 48px; margin-bottom: 10px;">🔴</h1>
            <h2 style="font-weight: 900; text-transform: uppercase;">正在生成生产环境资源</h2>
            <p style="color: #666;">请确保您的 GitHub 仓库中包含 <b>dist</b> 文件夹。</p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">提示：在本地运行 <b>npm run build</b> 后上传 dist 文件夹即可。</p>
        </div>
        """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
