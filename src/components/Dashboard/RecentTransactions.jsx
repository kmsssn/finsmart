// src/components/Dashboard/RecentTransactions.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteTransaction } from '../../store/transactionSlice';
import { FaTrash, FaEdit, FaComment } from 'react-icons/fa';
import Modal from '../UI/Modal';
import NotificationModal from '../UI/NotificationModal';
import TransactionForm from './TransactionForm';
import { formatAmount, formatDate } from '../../utils/formatters';

const RecentTransactions = () => {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showComment, setShowComment] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    transaction: null
  });
  const { transactions } = useSelector((state) => state.transactions);
  const { categories } = useSelector((state) => state.categories);
  const { balance } = useSelector((state) => state.transactions);
  const dispatch = useDispatch();
  
  // Сортируем транзакции по дате (сначала новые)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Берем последние 5 транзакций
  const recentTransactions = sortedTransactions.slice(0, 5);
  
  const handleDelete = (transaction) => {
    setDeleteConfirmation({
      isOpen: true,
      transaction
    });
  };
  
  const confirmDelete = () => {
    if (deleteConfirmation.transaction) {
      dispatch(deleteTransaction(deleteConfirmation.transaction.id));
      setDeleteConfirmation({
        isOpen: false,
        transaction: null
      });
    }
  };
  
  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      transaction: null
    });
  };
  
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };
  
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Неизвестная категория';
  };
  
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#7aa2f7';
  };
  
  if (recentTransactions.length === 0) {
    return <p className="text-gray-500 text-center py-4 rounded-2xl bg-gray-50">Нет транзакций. Добавьте свою первую транзакцию!</p>;
  }
  
  const toggleComment = (transactionId) => {
    if (showComment === transactionId) {
      setShowComment(null);
    } else {
      setShowComment(transactionId);
    }
  };
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left text-gray-500 font-medium">Дата</th>
              <th className="py-2 text-left text-gray-500 font-medium">Категория</th>
              <th className="py-2 text-left text-gray-500 font-medium">Сумма</th>
              <th className="py-2 text-center text-gray-500 font-medium">Комм.</th>
              <th className="py-2 text-right text-gray-500 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <tr 
                  className="border-b hover:bg-gray-50 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms`, animation: 'fadeIn 0.5s ease-out' }}
                >
                  <td className="py-3">{formatDate(transaction.date)}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ 
                          backgroundColor: getCategoryColor(transaction.categoryId) 
                        }}
                      ></div>
                      {getCategoryName(transaction.categoryId)}
                    </div>
                  </td>
                  <td className={`py-3 font-medium ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    <span className="inline-flex items-center">
                      {transaction.type === 'income' ? '+' : '-'} {formatAmount(transaction.amount)}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    {transaction.comment && (
                      <button
                        onClick={() => toggleComment(transaction.id)}
                        className={`p-2 rounded-full transition-colors ${
                          showComment === transaction.id 
                            ? 'bg-primary/20 text-primary' 
                            : 'text-gray-400 hover:text-primary hover:bg-primary/10'
                        }`}
                        title={transaction.comment ? "Показать комментарий" : "Нет комментария"}
                      >
                        <FaComment size={14} />
                      </button>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                        title="Редактировать"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction)}
                        className="p-2 text-danger hover:bg-danger/10 rounded-full transition-colors"
                        title="Удалить"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
                {showComment === transaction.id && transaction.comment && (
                  <tr className="bg-gray-50 animate-fade-in">
                    <td colSpan="5" className="py-2 px-4 border-b">
                      <div className="text-gray-600 text-sm border-l-2 border-primary pl-3 italic">
                        {transaction.comment}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {editingTransaction && (
        <Modal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)}>
          <TransactionForm
            transaction={editingTransaction}
            onClose={() => setEditingTransaction(null)}
          />
        </Modal>
      )}
      
      {/* Модальное окно подтверждения удаления */}
      <NotificationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelDelete}
        type="warning"
        title="Подтверждение удаления"
        message={deleteConfirmation.transaction ? 
          `Вы действительно хотите удалить эту транзакцию? ${
            deleteConfirmation.transaction.type === 'income' 
              ? `Сумма ${formatAmount(deleteConfirmation.transaction.amount)} будет снята с вашего баланса.`
              : `Сумма ${formatAmount(deleteConfirmation.transaction.amount)} будет возвращена на ваш баланс.`
          }` 
          : ''}
        autoClose={false}
      >
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={cancelDelete}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Отмена
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-dark"
          >
            Удалить
          </button>
        </div>
      </NotificationModal>
    </div>
  );
};

export default RecentTransactions;