import streamlit as st
import streamlit.components.v1 as components
import os

# 设置 Streamlit 页面配置
st.set_page_config(
    page_title="LG Subscribe Malaysia | Digital Partner Showroom",
    page_icon="🔴",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# 隐藏 Streamlit 默认的页眉和页脚，确保视觉沉浸感
hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            section.main > div {padding: 0;}
            iframe {border: none;}
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)

def main():
    # 确定构建目录路径
    build_dir = os.path.join(os.path.dirname(__file__), "dist")
    index_path = os.path.join(build_dir, "index.html")

    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
            
        # 将静态资源路径调整为能在 iframe 中正确加载的相对路径
        # 注意：在 Streamlit 环境中，通常建议将 dist 文件夹内的内容部署为静态资源
        # 这里我们直接渲染 HTML 内容，高度设为适应屏幕
        components.html(html_content, height=2000, scrolling=True)
    else:
        st.error("Build files not found! Please run 'npm run build' locally and commit the 'dist' folder.")
        st.info("如果您是在本地运行，请确保已执行 npm run build。如果是部署到 Streamlit Cloud，请务必将生成的 dist 文件夹也上传至 GitHub。")

if __name__ == "__main__":
    main()
