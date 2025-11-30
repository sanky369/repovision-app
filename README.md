# RepoVision

**RepoVision** is a React-based web application that transforms GitHub repository documentation into beautiful, hand-drawn style architecture diagrams using Google's Gemini generative AI models.

<img width="1171" height="755" alt="image" src="https://github.com/user-attachments/assets/25896fb1-9aa2-42c8-a641-2b2abaf93e5b" />


## 🚀 How It Works

1.  **Discovery**: The app fetches the `llms.txt` or `README.md` file from the provided public GitHub repository URL.
2.  **Analysis**: `gemini-2.5-flash` analyzes the technical documentation to identify key components, data flows, and infrastructure decisions. It synthesizes this into a detailed visual prompt.
3.  **Visualization**:
    *   **Primary**: Attempts to generate a high-resolution (2K) diagram using **Gemini 3 Pro Image Preview** (`gemini-3-pro-image-preview`). This model is optimized for complex prompt adherence and text rendering.
    *   **Fallback**: If the Pro model is unavailable (e.g., due to API key restrictions or permissions), the app automatically falls back to **Gemini 2.5 Flash Image** (`gemini-2.5-flash-image`) to ensure a result is always delivered.

## 🛠️ Usage

1.  **API Key**: Upon loading the app, you will be prompted to select a Google Cloud API Key via the secure dialog.
    *   *Recommendation*: Use a key associated with a billing-enabled project to access the high-quality Gemini 3 Pro model.
2.  **Input**: Paste the full URL of a public GitHub repository (e.g., `https://github.com/facebook/react`).
3.  **Visualize**: Click the "Visualize" button. The app will verify the repo, analyze the architecture, and generate the image.
4.  **Result**: View the generated whiteboard diagram and the AI's reasoning. You can download the image directly.

## 📦 Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **AI Integration**: Google GenAI SDK (`@google/genai`)
*   **Services**:
    *   `githubService`: Fetches raw content from GitHub.
    *   `geminiService`: Orchestrates the two-step AI generation process (Text-to-Text -> Text-to-Image).

## ⚠️ Troubleshooting

*   **"Access Denied" or Permission Errors**: The Gemini 3 Pro Image model requires a paid tier (billing enabled) on Google Cloud. If your key does not have this, the app will attempt to fallback to the Flash model. If both fail, ensure your API key is valid and has the Generative Language API enabled.
*   **Repository Not Found**: Ensure the repository is public and contains a `README.md` or `llms.txt` file in the root directory of the `main` or `master` branch.
