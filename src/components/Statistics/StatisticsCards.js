import React from 'react';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

const StatisticsCards = ({ statistics }) => {
    const formatNumber = (num) => {
        return new Intl.NumberFormat('fr-CM').format(num);
    };

    const calculatePercentageChange = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous * 100).toFixed(1);
    };

    const statisticsData = [
        {
            title: 'Total Certificates',
            value: statistics?.usage?.total || 0,
            change: calculatePercentageChange(
                statistics?.usage?.total || 0,
                (statistics?.usage?.total || 0) - (statistics?.usage?.thisMonth || 0)
            ),
            icon: 'pi pi-file-pdf',
            color: 'blue',
            subtitle: `+${statistics?.usage?.thisMonth || 0} this month`
        },
        {
            title: 'Available Stock',
            value: statistics?.available?.total || 0,
            change: '+5.2',
            icon: 'pi pi-box',
            color: 'green',
            subtitle: 'Ready for issuance'
        },
        {
            title: 'Used Certificates',
            value: statistics?.used?.total || 0,
            change: calculatePercentageChange(
                statistics?.used?.total || 0,
                (statistics?.used?.total || 0) - (statistics?.used?.thisMonth || 0)
            ),
            icon: 'pi pi-check-circle',
            color: 'orange',
            subtitle: `+${statistics?.used?.thisMonth || 0} this month`
        },
        {
            title: 'Pending Orders',
            value: 24, // This would come from orders API
            change: '-12.3',
            icon: 'pi pi-clock',
            color: 'purple',
            subtitle: 'Awaiting approval'
        }
    ];

    const getGradientClass = (color) => {
        const gradients = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            orange: 'bg-orange-500',
            purple: 'bg-purple-500'
        };
        return gradients[color] || 'bg-blue-500';
    };

    const getIconBackground = (color) => {
        const backgrounds = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-orange-600',
            purple: 'bg-purple-100 text-purple-600'
        };
        return backgrounds[color] || 'bg-blue-100 text-blue-600';
    };

    if (!statistics) {
        return (
            <div className="grid">
                {[1, 2, 3, 4].map((index) => (
                    <div key={index} className="col-12 md:col-6 lg:col-3">
                        <Card className="statistics-card-skeleton">
                            <div className="flex align-items-center">
                                <Skeleton shape="circle" size="3rem" className="mr-3" />
                                <div className="flex-1">
                                    <Skeleton width="80%" height="1rem" className="mb-2" />
                                    <Skeleton width="60%" height="2rem" className="mb-1" />
                                    <Skeleton width="70%" height="0.8rem" />
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid">
            {statisticsData.map((stat, index) => (
                <div key={index} className="col-12 md:col-6 lg:col-3">
                    <Card className="statistics-card h-full">
                        <div className="flex align-items-start justify-content-between">
                            <div className="flex-1">
                                <div className="text-500 font-medium text-sm mb-2 uppercase tracking-wider">
                                    {stat.title}
                                </div>
                                <div className="text-900 font-bold text-3xl mb-2">
                                    {formatNumber(stat.value)}
                                </div>
                                <div className="flex align-items-center">
                  <span className={`text-sm ${
                      parseFloat(stat.change) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                  }`}>
                    <i className={`pi ${
                        parseFloat(stat.change) >= 0
                            ? 'pi-arrow-up'
                            : 'pi-arrow-down'
                    } mr-1`}></i>
                      {Math.abs(parseFloat(stat.change))}%
                  </span>
                                    <span className="text-500 text-sm ml-2">{stat.subtitle}</span>
                                </div>
                            </div>
                            <div className={`
                p-3 border-round-lg ${getIconBackground(stat.color)}
              `}>
                                <i className={`${stat.icon} text-2xl`}></i>
                            </div>
                        </div>

                        {/* Progress bar indicator */}
                        <div className="mt-3">
                            <div className="bg-gray-200 border-round-lg" style={{ height: '4px' }}>
                                <div
                                    className={`${getGradientClass(stat.color)} border-round-lg h-full transition-all transition-duration-300`}
                                    style={{
                                        width: `${Math.min(100, Math.max(0, parseFloat(stat.change) + 50))}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
};

export default StatisticsCards;