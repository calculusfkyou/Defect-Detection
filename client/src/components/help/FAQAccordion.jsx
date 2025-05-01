import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

export default function FAQAccordion({ faqs }) {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleItem(index)}
            className="flex justify-between items-center w-full text-left px-4 py-3 bg-gray-50"
          >
            <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
            {openItems[index] ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {openItems[index] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="px-4 py-3 text-gray-600"
            >
              <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
