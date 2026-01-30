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

# 2. 隐藏 Streamlit 组件边距，实现全屏效果
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
    # 获取当前 URL 中的参数（用于下线推广）
    params = st.query_params
    wa = params.get("wa", "")
    name = params.get("name", "")
    
    # 构造带参数的内部查询字符串
    query_str = f"?wa={wa}&name={urllib.parse.quote(name)}" if wa else ""

    # 寻找构建目录
    current_dir = os.path.dirname(__file__)
    dist_dir = os.path.join(current_dir, "dist")
    dist_index = os.path.join(dist_dir, "index.html")
    
    if os.path.exists(dist_index):
        try:
            with open(dist_index, 'r', encoding='utf-8') as f:
                html_content = f.read()
                
            # 核心修复：注入 Base 标签和参数处理脚本
            # 解决白屏的关键：让浏览器知道去哪里找 assets
            injection = f"""
            <base href="./">
            <script>
                // 如果当前页面没有参数，但 Streamlit 传进来了，则重定向（仅执行一次）
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
        # 如果没有 dist 文件夹，显示美观的引导界面
        st.container()
        st.markdown(f"""
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; font-family: sans-serif; text-align: center; color: #333;">
            <h1 style="color: #e60044; font-size: 48px; margin-bottom: 10px;">🔴</h1>
            <h2 style="font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">展示厅正在准备中</h2>
            <p style="color: #666; max-width: 500px; line-height: 1.6;">
                您的代码已经部署成功，但<b>生产环境资源包 (dist)</b> 尚未上传。
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 20px; text-align: left; border: 1px solid #eee; margin-top: 30px;">
                <p style="margin: 0; font-weight: bold; font-size: 14px;">最后一步操作：</p>
                <ol style="font-size: 13px; color: #555; margin-top: 10px;">
                    <li>在您的电脑终端运行：<code>npm run build</code></li>
                    <li>将生成的 <b>dist</b> 文件夹提交并推送到 GitHub。</li>
                    <li>Streamlit 会自动检测到更新并展示您的商城。</li>
                </ol>
            </div>
            <p style="font-size: 10px; color: #ccc; margin-top: 40px; text-transform: uppercase; letter-spacing: 3px;">LG Digital Partner Platform</p>
        </div>
        """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
