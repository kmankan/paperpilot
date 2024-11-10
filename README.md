# 📚 PaperPilot

PaperPilot is an intelligent PDF reader that enhances academic paper comprehension through interactive keyword analysis and contextual understanding.

## ✨ Features

- **Interactive PDF Viewing**: Seamless PDF document reading with keyword highlighting
- **Smart Keyword Detection**: Automatically identifies and highlights important terms
- **Contextual Analysis**: Provides detailed context for keywords within the paper
- **Field Mapping**: Visualizes where concepts fit in the broader academic landscape
- **Dictionary Definitions**: Quick access to academic definitions and usage examples
- **Idea Trees**: Visual representation of concept relationships and implications
- **Wikipedia Integration**: Direct access to related Wikipedia articles

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- npm/yarn/pnpm

### Installation

1. Clone the repository:
``` bash
git clone https://github.com/yourusername/paperpilot.git
cd paperpilot
```

2. Install dependencies:
``` bash
bun install
```

3. Create a `.env.local` file in the root directory:
``` typescript
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
``` bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see PaperPilot in action!

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **PDF Processing**: react-pdf
- **AI Integration**: OpenAI GPT API
- **Visualization**: Mermaid.js
- **State Management**: React Hooks

## 📖 Usage

1. Upload or open a PDF academic paper
2. Click on highlighted keywords to view:
   - Field context diagrams
   - Dictionary definitions
   - Paper-specific context
   - Concept relationship trees
3. Explore related Wikipedia articles through the integrated viewer
4. Navigate between different analysis views using the tab interface

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- Next.js team for the amazing framework
- React-PDF for PDF rendering capabilities
- Mermaid.js for diagram generation
- All contributors who help improve PaperPilot

## 🔮 Future Plans

- [ ] Enhanced keyword detection algorithm
- [ ] Support for multiple document comparison
- [ ] Collaborative annotation features
- [ ] Export functionality for generated insights
- [ ] Integration with reference management systems
- [ ] Custom LLM model fine-tuning

---

Built with ❤️ for researchers and students everywhere