import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as echarts from 'echarts';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexTooltip,
  ApexStroke,
  ApexMarkers,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  xaxis: ApexXAxis;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  markers: ApexMarkers;
};

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [NgApexchartsModule, RouterLink],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
})
//ApexChart and eChart
export class IndexComponent implements OnInit, AfterViewInit {
  public chartOptions: any;
  ngOnInit(): void {
    this.initBudgetChart();

    this.chartOptions = {
      series: [
        {
          name: 'Sales',
          data: [31, 40, 28, 51, 42, 82, 56],
        },
        {
          name: 'Revenue',
          data: [11, 32, 45, 32, 34, 52, 41],
        },
        {
          name: 'Customers',
          data: [15, 11, 32, 18, 9, 24, 11],
        },
      ],
      chart: {
        height: 350,
        type: 'area',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.3,
          opacityTo: 0.4,
          stops: [0, 90, 100],
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      xaxis: {
        type: 'datetime',
        categories: [
          '2018-09-19T00:00:00.000Z',
          '2018-09-19T01:30:00.000Z',
          '2018-09-19T02:30:00.000Z',
          '2018-09-19T03:30:00.000Z',
          '2018-09-19T04:30:00.000Z',
          '2018-09-19T05:30:00.000Z',
          '2018-09-19T06:30:00.000Z',
        ],
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
    };
  }

  initBudgetChart(): void {
    var chartDom = document.querySelector('#budgetChart');
    if (chartDom) {
      var budgetChart = echarts.init(chartDom as HTMLElement);
      budgetChart.setOption({
        legend: {
          data: ['Allocated Budget', 'Actual Spending'],
        },
        radar: {
          shape: 'polygon', // Can be 'polygon' or 'circle'
          indicator: [
            { name: 'Sales', max: 6500 },
            { name: 'Administration', max: 16000 },
            { name: 'Information Technology', max: 30000 },
            { name: 'Customer Support', max: 38000 },
            { name: 'Development', max: 52000 },
            { name: 'Marketing', max: 25000 },
          ],
          axisLabel: {
            show: true, // Shows axis labels
          },
          splitNumber: 5, // Number of segments or ticks in each axis
        },
        series: [
          {
            name: 'Budget vs spending',
            type: 'radar',
            data: [
              {
                value: [4200, 3000, 20000, 35000, 50000, 18000],
                name: 'Allocated Budget',
              },
              {
                value: [5000, 14000, 28000, 26000, 42000, 21000],
                name: 'Actual Spending',
              },
            ],
          },
        ],
      });
    }
  }

  ngAfterViewInit() {
    this.initChart();
  }

  initChart() {
    // Type assertion to HTMLElement
    const chartDom = document.querySelector('#trafficChart') as HTMLElement;

    // Ensure chartDom is not null
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'axis', // Axis trigger for charts with x/y axes
          axisPointer: {
            type: 'shadow', // Default type for bar charts
          },
        },
        legend: {
          top: '5%',
          left: 'center',
        },
        xAxis: {
          type: 'category', // Category type for x-axis (e.g., labels for bars)
          data: ['Search Engine', 'Direct', 'Email', 'Union Ads', 'Video Ads'],
        },
        yAxis: {
          type: 'value', // Value type for y-axis (numeric data)
          min: 0, // Set minimum value for y-axis
          max: 1200, // Set maximum value based on your data
          interval: 200, // Interval between ticks
        },
        series: [
          {
            name: 'Access From',
            type: 'bar', // Set to 'bar' for bar chart
            data: [1048, 735, 580, 484, 300], // Data corresponding to xAxis categories
            label: {
              show: true,
              position: 'top',
            },
          },
        ],
      };

      myChart.setOption(option);
    } else {
      console.error('Chart DOM element not found');
    }
  }
}
