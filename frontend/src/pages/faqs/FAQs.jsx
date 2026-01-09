import { useState } from 'react';
import FAQItem from './components/FAQItem';
import '../../index.css';

export default function FAQs() {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      category: 'Getting Started',
      faqs: [
        {
          question: 'What is Eco-Impact AI and how does it work?',
          answer: 'Eco-Impact AI is an intelligent platform that uses machine learning models to simulate the real-world impact of climate policies. You input policy parameters like tax rate, coverage area, and duration, and our AI models predict outcomes including CO2 reduction, revenue generation, environmental impacts, and risk assessments. The platform transforms complex climate science into actionable insights for policymakers, researchers, and organizations.'
        },
        {
          question: 'Do I need an account to use the simulation tool?',
          answer: 'Yes, you need to create a free account to run simulations. This allows us to save your simulation history, enable comparison features, and provide personalized insights. You can explore the platform without an account, but signing up is required to generate and save policy simulations.'
        },
        {
          question: 'What information do I need to create a simulation?',
          answer: 'To create a simulation, you\'ll need to specify several key parameters: the country where the policy will be implemented, the policy type (Carbon Tax or ETS - Emissions Trading System), the tax rate per tonne, policy coverage percentage (the portion of total emissions subject to the policy), the start year, and the projection duration in years. The platform provides intuitive controls to help you configure these settings.'
        }
      ]
    },
    {
      category: 'AI Models & Accuracy',
      faqs: [
        {
          question: 'How accurate are the AI predictions?',
          answer: 'Our machine learning models are trained on extensive historical climate and economic data, government reports, and validated research studies. While predictions cannot guarantee exact future outcomes, they provide statistically informed projections based on similar historical scenarios. The models continuously improve as more data becomes available. Always consider these as tools for decision-making support rather than definitive forecasts.'
        },
        {
          question: 'What data sources do the models use?',
          answer: 'Our models are trained on authoritative data from two primary sources: the World Bank Carbon Pricing Dashboard and Our World in Data. The World Bank Carbon Pricing Dashboard is maintained by the World Bank Group and provides comprehensive, verified data on carbon pricing initiatives worldwide, making it a trusted source for policymakers and researchers globally. Our World in Data is an independent scientific research organization maintained by the Global Change Data Lab at the University of Oxford, known for transparent, peer-reviewed data on global issues including climate change. These credible sources ensure our models are built on validated, high-quality data from internationally recognized institutions.'
        },
        {
          question: 'Can I trust the revenue projections for my organization?',
          answer: 'The revenue projections are based on historical patterns and statistical models that analyze similar policy implementations. However, actual revenue can vary based on market conditions, implementation specifics, and external factors. We recommend using these projections as one component of a broader financial planning process, alongside consultation with economic advisors and real-world market analysis.'
        }
      ]
    },
    {
      category: 'Carbon Pricing & Policies',
      faqs: [
        {
          question: 'What is carbon pricing and why does it matter?',
          answer: 'Carbon pricing is an economic policy tool that places a monetary value on carbon emissions, typically through carbon taxes or cap-and-trade systems. It incentivizes businesses and individuals to reduce emissions by making carbon-intensive activities more expensive. Effective carbon pricing is widely recognized by economists and climate scientists as one of the most efficient ways to drive emissions reductions while generating revenue for climate initiatives.'
        },
        {
          question: 'How should I determine the appropriate tax rate?',
          answer: 'Tax rates vary significantly across regions, typically ranging from $5 to $150 per tonne of CO2 equivalent. Factors to consider include your country\'s economic capacity, existing energy infrastructure, social impact, and alignment with international carbon pricing recommendations. The platform allows you to experiment with different tax rates to see how they affect emissions reduction and revenue generation. Many economists recommend starting with a modest rate and gradually increasing it over time.'
        },
        {
          question: 'What does policy coverage percentage mean?',
          answer: 'Policy coverage percentage refers to the portion of total emissions in your selected country that will be subject to the carbon pricing policy. For example, 80% coverage means the policy applies to 80% of the country\'s total emissions. Higher coverage typically leads to greater emissions reductions but may require more complex implementation. You can simulate different coverage levels to find the optimal balance between environmental impact and feasibility.'
        },
        {
          question: 'What are the two policy types available and what does tax rate mean?',
          answer: 'The platform supports two primary carbon pricing policy types: Carbon Tax and ETS (Emissions Trading System). For both policy types, you input the "Tax Rate" which represents the price charged per tonne of CO2 emissions. This tax rate directly influences the financial incentives for emission reductions and the revenue generated by the policy. For Carbon Tax policies, the tax rate is a fixed price set by the government, providing a direct and predictable cost that emitters pay for each tonne they release. For ETS (Emissions Trading System) policies, the tax rate represents the market-clearing price that emerges from the emissions trading market, reflecting the equilibrium price at which emission allowances are bought and sold. Regardless of the policy type, the tax rate you specify captures the essential price signal that drives behavior change and determines the policy\'s economic and environmental impact.'
        }
      ]
    },
    {
      category: 'Results & Interpretation',
      faqs: [
        {
          question: 'What do the environmental impact metrics mean?',
          answer: 'Environmental impact metrics include CO2 reduction potential (total emissions avoided), emissions reduction percentage (relative change), and projected environmental benefits. CO2 reduction shows the absolute amount of emissions that would be prevented, while the percentage shows the relative improvement. These metrics help you understand both the scale and proportion of environmental benefits your policy would achieve.'
        },
        {
          question: 'How should I interpret risk assessments?',
          answer: 'Risk assessments evaluate potential challenges and uncertainties associated with your policy. This includes economic risks (such as impact on industries), implementation risks (feasibility challenges), and social risks (public acceptance). Lower risk scores indicate policies that are more likely to be successfully implemented with minimal negative side effects. However, some high-impact policies may have higher risks that need to be managed rather than avoided.'
        },
        {
          question: 'Can I compare multiple policy scenarios?',
          answer: 'Yes, after creating an account, you can save your simulations and use the Compare feature to analyze multiple policy scenarios side-by-side. This allows you to evaluate different tax rates, coverage levels, durations, and policy types to identify which combination offers the best balance of emissions reduction, revenue generation, and risk management for your specific goals.'
        }
      ]
    },
    {
      category: 'Technical Support',
      faqs: [
        {
          question: 'What browsers are supported?',
          answer: 'Eco-Impact AI works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for optimal performance and security. The platform is responsive and works on desktop, tablet, and mobile devices.'
        },
        {
          question: 'How do I export or share my simulation results?',
          answer: 'You can export your simulation results in multiple formats. For individual simulations, you can download detailed reports as PDF or CSV files from the simulation detail view. The PDF export includes comprehensive reports with policy parameters, financial predictions, environmental impacts, risk assessments, and recommendations. The CSV export provides structured data including all simulation details, prediction results, environmental equivalencies, year-by-year projections, and similar policies. For comparisons, you can also export comparison reports in both PDF and CSV formats, allowing you to analyze multiple policy scenarios side-by-side and share findings with stakeholders.'
        },
        {
          question: 'What should I do if my simulation fails or shows errors?',
          answer: 'If you encounter errors, first check that all required fields are filled with valid values. Ensure your tax rate is within reasonable ranges (typically $1-$500 per tonne) and that your coverage percentage is between 0-100%. If problems persist, try refreshing the page or clearing your browser cache. For persistent issues, please note the error message and contact support with details about your simulation parameters.'
        }
      ]
    }
  ];

  const allFAQs = faqCategories.flatMap(category => 
    category.faqs.map(faq => ({ ...faq, category: category.category }))
  );

  const filteredFAQs = searchTerm
    ? allFAQs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allFAQs;

  const groupedFilteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      filteredFAQs.some(filteredFaq => filteredFaq.question === faq.question)
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="faqs-page">
      <section className="faqs-hero">
        <div className="faqs-hero-background">
          <div className="dots-pattern"></div>
        </div>
        <div className="faqs-hero-content">
          <h1 className="faqs-hero-title">Frequently Asked Questions</h1>
          <p className="faqs-hero-subtitle">
            Find answers to common questions about climate policy simulation, AI models, and using Eco-Impact AI
          </p>
          <div className="faqs-search-container">
            <input
              type="text"
              className="faqs-search-input"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="faqs-search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>
      </section>

      <section className="faqs-content">
        <div className="faqs-content-wrapper">
          {groupedFilteredFAQs.length === 0 ? (
            <div className="faqs-no-results">
              <p>No FAQs found matching your search.</p>
              <button
                className="faqs-clear-search"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            </div>
          ) : (
            groupedFilteredFAQs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="faqs-category">
                <h2 className="faqs-category-title">{category.category}</h2>
                <div className="faqs-list">
                  {category.faqs.map((faq, faqIndex) => (
                    <FAQItem
                      key={faqIndex}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

